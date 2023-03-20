export const DEV = {
  headless: false,
  slowMo: 50,
  devtools: false,
  defaultViewport: { width: 1440, height: 1440 },
  ignoreHTTPSErrors: false, //忽略 https 报错
  args: [
    '-disable - gpu', // GPU硬件加速
    '-disable - dev - shm - usage', // 创建临时文件共享内存
    '-disable - setuid - sandbox', // uid沙盒
    '-no - first - run', // 没有设置首页。在启动的时候，就会打开一个空白页面。
    '-no - sandbox', // 沙盒模式
    '-no - zygote',
    '-single - process' // 单进程运行
  ]
};
export const PROD = {
  headless: true,
  slowMo: 0,
  devtools: false,
  defaultViewport: null,
  ignoreHTTPSErrors: false,
  args: [
    '-disable - gpu', // GPU硬件加速
    '-disable - dev - shm - usage', // 创建临时文件共享内存
    '-disable - setuid - sandbox', // uid沙盒
    '-no - first - run', // 没有设置首页。在启动的时候，就会打开一个空白页面。
    '-no - sandbox', // 沙盒模式
    '-no - zygote',
    '-single - process' // 单进程运行
  ]
};

export const MIX = {
  headless: false,
  slowMo: 10,
  // devtools: true,
  defaultViewport: { width: 1440, height: 1340 },
  ignoreHTTPSErrors: false, //忽略 https 报错
};

export const FAST_DEV = {
  headless: false,
  slowMo: 0,
  devtools: false,
  defaultViewport: null,
  ignoreHTTPSErrors: true, //忽略 https 报错
  args: [
    '-disable - gpu', // GPU硬件加速
    '-disable - dev - shm - usage', // 创建临时文件共享内存
    '-disable - setuid - sandbox', // uid沙盒
    '-yes - first - run', // 没有设置首页。在启动的时候，就会打开一个空白页面。
    '-no - sandbox', // 沙盒模式
    '-no - zygote',
    '-single - process' // 单进程运行
  ]
};

export const DEFAULT_SPEED = {
  input: 0,
  select: 500,
  radio: 50,
  checkbox: 50,
  button: 50,
  page: 1000,
  navigation: 45000,
  other: 45000
};