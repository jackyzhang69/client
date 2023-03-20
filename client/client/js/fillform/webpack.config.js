const path = require('path')

// all config info in webpack  should in moudel.exports

module.exports = {
    // 指定文件入口
    entry: "./src/fill.ts",

    output: {
        // 指定文件所在目录
        path: path.resolve(__dirname, 'dist'),
        // 打包后的问题
        filename: "bundle.js",
        clean: true
    },
    // 之地当webpack打包时需要使用的模块
    module: {
        // 指定加载的规则
        rules: [{
            // test指定估计则生效的文件
            test: /\.ts$/,
            // 要使用的loader
            use: 'ts-loader',
            // 要排除的文件
            exclude: /node-modules/
        }]
    },
    // 用来设置引用模块
    resolve: {
        extensions: ['.ts', '.js']
    },
    // 模式设置为开发模式、或者production模式
    mode: 'development'

}