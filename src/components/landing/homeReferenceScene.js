// Lossless, detail-restored photographic layer from the October 14 reference.
// Conservative masks stay entirely in the sky, above the hijab, sun and buildings.
export const HOME_REFERENCE_SCENE = {
  url: "/images/perspective/home-hijab-retouched.png",
  source: { width: 1888, height: 833 },
  regions: [
    {
      name: "western sunset clouds",
      points: [
        [12, 10],
        [770, 10],
        [770, 155],
        [665, 160],
        [490, 122],
        [295, 124],
        [110, 95],
        [12, 83],
      ],
    },
    {
      name: "high central clouds",
      points: [
        [800, 8],
        [1335, 8],
        [1335, 38],
        [1210, 32],
        [1090, 24],
        [960, 32],
        [810, 47],
      ],
    },
    {
      name: "eastern cloud bank",
      points: [
        [1420, 12],
        [1870, 12],
        [1870, 155],
        [1808, 160],
        [1725, 152],
        [1590, 180],
        [1470, 173],
        [1400, 113],
      ],
    },
  ],
};
