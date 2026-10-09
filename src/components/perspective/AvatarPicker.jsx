import { useEffect, useRef, useState } from "react";
import { Check, Upload, UserRound } from "lucide-react";
import { AVATARS, preparePhoto } from "@/lib/perspective/avatar";
export default function AvatarPicker({ value, onChange, disabled = false }) {
  const input = useRef(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!value?.file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value?.file]);
  async function chooseFile(event) {
    setError("");
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      await preparePhoto(file);
      onChange({ file });
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <fieldset className="px-avatar-picker" disabled={disabled}>
      <legend>
        Choose your profile picture <small>Optional</small>
      </legend>
      <div className="px-picture-options">
        <button
          type="button"
          className={!value?.file ? "selected" : ""}
          onClick={() => onChange({ preset: value?.preset || AVATARS[0].id })}
        >
          <UserRound size={17} />
          Choose an avatar
        </button>
        <button
          type="button"
          className={value?.file ? "selected" : ""}
          onClick={() => input.current.click()}
        >
          <Upload size={17} />
          Upload your photo
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={chooseFile}
      />
      {value?.file ? (
        <div className="px-photo-preview">
          <img src={preview || undefined} alt="Your selected photo" />
          <span>
            {value.file.name}
            <small>JPEG, PNG or WebP · up to 2 MB</small>
          </span>
        </div>
      ) : (
        <div
          className="px-avatar-grid"
          role="group"
          aria-label="Preset avatars"
        >
          {AVATARS.map((avatar) => (
            <button
              type="button"
              key={avatar.id}
              aria-label={`Choose ${avatar.label.toLowerCase()} avatar`}
              aria-pressed={value?.preset === avatar.id}
              onClick={() => onChange({ preset: avatar.id })}
            >
              <span
                className="px-avatar-preset"
                style={{
                  backgroundPosition: `${(avatar.index % 5) * 25}% ${avatar.index < 5 ? 0 : 100}%`,
                }}
              />
              {value?.preset === avatar.id && (
                <Check className="px-avatar-check" size={16} />
              )}
            </button>
          ))}
        </div>
      )}
      {value && (value.file || value.preset) && (
        <button
          type="button"
          className="px-text-button"
          onClick={() => onChange(null)}
        >
          Use my current picture or initials
        </button>
      )}
      {error && (
        <p className="px-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
