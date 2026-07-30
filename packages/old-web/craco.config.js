const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        purgecss({
          content: ["./**/*.html"],
          defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        }),
        require("cssnano")({
          preset: "default",
        }),
      ],
    },
  },
}
