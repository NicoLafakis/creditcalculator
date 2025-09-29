export default {
  plugins: {
    // Use postcss-preset-env to enable modern CSS features and automatic prefixing
    // based on browserslist. It complements Tailwind and Autoprefixer.
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true
      }
    },
    tailwindcss: {},
    autoprefixer: {},
  },
}
