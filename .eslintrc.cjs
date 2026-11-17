module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:storybook/recommended"
    ],
    "overrides": [
        {
            // JS <-> WASM boundary: values are untyped JsValues on the Rust side
            "files": ["src/wasm/**/*.ts"],
            "rules": {
                "@typescript-eslint/no-explicit-any": "off"
            }
        },
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "react"
    ],
    "rules": {
        "react/prop-types": "off",
    },
    "ignorePatterns": [
        "**/*.test.*",
        "**/*.stories.*",
        "src/wasm/generated/**",
    ],
    "settings": {
        "react": {
            "version": "detect"
        }
    }
}
