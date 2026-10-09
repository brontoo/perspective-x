import { supabase } from "@/lib/supabaseClient";
export const AVATARS = [
  "Wavy brown hair",
  "Navy hijab",
  "Brown hair and glasses",
  "Baseball cap",
  "Natural curly hair",
  "Loose brunette waves",
  "Golden beanie",
  "Long auburn hair",
  "Dark hair and glasses",
  "Purple hair",
].map((label, index) => ({ id: `portrait-${index + 1}`, label, index }));
export function presetFor(user) {
  return AVATARS.find((a) => a.id === user?.user_metadata?.px_avatar_id);
}
export async function ownUser(expectedId) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.id !== expectedId)
    throw new Error(
      "Your session has expired. Sign in again before changing your picture.",
    );
  return data.user;
}
export async function signedAvatar(path) {
  if (
    !path ||
    typeof path !== "string" ||
    path.includes("..") ||
    path.startsWith("http")
  )
    return null;
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 900);
  return error ? null : data.signedUrl;
}
export async function savePreset(userId, id) {
  await ownUser(userId);
  if (id !== null && !AVATARS.some((a) => a.id === id))
    throw new Error("Choose a valid avatar.");
  const { error } = await supabase.auth.updateUser({
    data: { px_avatar_id: id },
  });
  if (error) throw error;
}
export async function preparePhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPEG, PNG or WebP image.");
  if (file.size > 2 * 1024 * 1024)
    throw new Error("Image must be 2 MB or smaller.");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This file could not be read as an image.");
  });
  try {
    if (
      !bitmap.width ||
      !bitmap.height ||
      bitmap.width > 10000 ||
      bitmap.height > 10000
    )
      throw new Error("Image dimensions are too large.");
    const canvas = document.createElement("canvas");
    const side = Math.min(bitmap.width, bitmap.height);
    canvas.width = canvas.height = Math.min(side, 512);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Unable to prepare your image.")),
        "image/webp",
        0.9,
      ),
    );
  } finally {
    bitmap.close();
  }
}
export async function savePhoto(userId, file) {
  const photo = await preparePhoto(file);
  await ownUser(userId);
  // Fail closed: signed URLs alone do not make a public bucket private.
  const { data: bucket, error: bucketError } =
    await supabase.storage.getBucket("avatars");
  if (bucketError || !bucket || bucket.public)
    throw new Error(
      "Photo uploads require a verified private avatars bucket. You can choose a preset avatar meanwhile.",
    );
  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, photo, { contentType: "image/webp", upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", userId)
    .select("id")
    .single();
  if (error || !data) {
    await supabase.storage.from("avatars").remove([path]);
    throw error || new Error("Your profile picture could not be saved.");
  }
  await savePreset(userId, null);
  return path;
}
