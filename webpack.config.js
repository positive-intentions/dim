const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const WebpackPwaManifest = require('webpack-pwa-manifest');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'main.js',
        path: __dirname + '/dist',
        publicPath: 'auto',
    },
    devServer: {
        static: path.resolve(__dirname, "/dist"),
        //   watchContentBase: true,
        hot: true,
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|ts|jsx|tsx)$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: ["@babel/preset-react"],
                },
            },
            // css and scss loader
            {
                // test: /\.css$/,
                test: /\.(css|scss)$/,
                use: ["style-loader", "css-loader"],
            },

            // image loader
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new WebpackPwaManifest({
            filename: "manifest.json",
            name: 'positive-intentions',
            short_name: 'PI',
            description: 'positive-intentions',
            "icons": [
                {
                    src: path.resolve('./public/favicon.ico'),
                    sizes: [96] // multiple sizes
                },
                {
                    src: path.resolve('./public/logo512.png'),
                    sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
                    maskable: true,
                }


            ],
            "start_url": ".",
            "display": "standalone",
            "theme_color": "#44b700",
            "background_color": "#ffffff",
            // crossorigin: 'use-credentials', // can be null, use-credentials or anonymous
            inject: true,
        }),
        new ModuleFederationPlugin({
            name: 'dim',
            filename: 'remoteEntry.js',
            exposes: {
                '.': './src/stories/components/dim.ts',
            },
            shared: { react: { singleton: true }, "react-dom": { singleton: true } }
        }),
    ],
};