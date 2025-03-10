const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/App.jsx",
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "bundle.js"
    },

    resolve: {
        extensions: [".js", ".jsx"],
    }, 

    module: {  
        rules: [
            // Use babel-loader for JavaScript files
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                  loader: "babel-loader"
                }
            },
        ],
    },

    // Config for webpack-dev-server
    devServer: {
        port: 3000,
        open: true,
        hot: true,
        // compress: true,

        static: {
            directory: path.join(__dirname, 'public'),
        },
    },
}