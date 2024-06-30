var tocData = {
  math: {
    title: '数学',
    color: 'yellow',
    favicon: 'pikachu.png',
    toc: [
      {
        title: '示例',
        articles: [
          { title: '公式编辑器', src: 'example/editor.html', date: '2022-01-12' },
          { title: 'Mathml', src: 'example/mathml.html' },
          { title: '曲面在线绘制', src: 'example/surface.html', date: '2021-12-10' },
        ]
      },
      {
        title: '未分类',
        articles: [
          { title: '问题', src: 'misc/0.html', date: '2022-02-16' },
          { title: '三角函数', src: 'misc/2.html', date: '2022-11-21' },
          { title: '不等式', src: 'misc/3.html', date: '2022-07-29' },
          { title: '微积分不等式', src: 'misc/4.html', date: '2023-05-25' },
          { title: '因式分解', src: 'misc/5.html', date: '2022-09-18' },
          { title: '数学家', src: 'misc/6.html', date: '2022-08-29' },
          { title: '算术与进制', src: 'misc/7.html', date: '2022-02-06' },
        ]
      },
      {
        title: '高等代数',
        articles: [
          { title: '初等代数', src: 'linalg/0.html', date: '2023-05-05' },
          { title: '矩阵', src: 'linalg/1.html', date: '2022-02-16' },
          { title: '行列式', src: 'linalg/2.html', date: '2021-12-06' },
          { title: '向量的相关性与线性方程组', src: 'linalg/3.html', date: '2021-12-14' },
          { title: '线性空间', src: 'linalg/4.html' },
          { title: '线性映射与线性变换', src: 'linalg/5.html' },
          { title: '特征值与特征向量', src: 'linalg/6.html', date: '2024-04-12' },
          { title: 'λ 矩阵与相似标准形', src: 'linalg/7.html', date: '2023-06-01' },
          { title: '线性空间中的度量与内积', src: 'linalg/8.html', date: '2024-04-12' },
          { title: '实二次型与正定矩阵', src: 'linalg/9.html', date: '2024-04-11' },
          { title: '张量初步', src: 'linalg/10.html', date: '2023-08-27' },
        ]
      },
      {
        title: '数学分析',
        articles: [
          { title: '附录', src: 'analysis/0.html', date: '2022-04-24' },
          { title: '初等函数', src: 'analysis/1.html' },
          { title: '数列的极限', src: 'analysis/2.html', date: '2024-06-30' },
          { title: '函数的极限与连续性', src: 'analysis/3.html', date: '2022-03-04' },
          { title: '导数的应用', src: 'analysis/5.html', date: '2023-10-09' },
          { title: '不定积分', src: 'analysis/6.html', date: '2022-04-10' },
          { title: '定积分与广义积分', src: 'analysis/7.html', date: '2023-05-25' },
          { title: '特殊函数 (1): Gamma 函数, Euler 和, 指对数积分', src: 'analysis/8.html', date: '2022-05-15' },
          { title: '特殊函数 (2): 椭圆函数, 超几何函数', src: 'analysis/9.html', data: '2022-04-10' },
          { title: '特殊函数 (3): Bernoulli 数与 Riemann zeta 函数', src: 'analysis/10.html', date: '2022-04-27' },
          { title: '常数项级数', src: 'analysis/11.html' },
          { title: '函数列与函数项级数', src: 'analysis/12.html' },
          { title: 'Fourier 级数', src: 'analysis/13.html' },
          { title: '多元函数的极限与连续性', src: 'analysis/14.html' },
          { title: '多元函数微分学', src: 'analysis/15.html', date: '2022-12-01' },
          { title: '多元函数的极值', src: 'analysis/17.html' },
          { title: '重积分', src: 'analysis/19.html' },
          { title: '场论初步', src: 'analysis/22.html', date: '2022-04-28' },
          { title: '分数阶微积分', src: 'analysis/23.html' },
          { title: '函数方程', src: 'analysis/24.html' },
        ]
      },
      {
        title: '数论',
        articles: [
          { title: '整数, 有理数, 代数数, 连分数', src: 'number/0.html' },
          { title: '整除, 最大公约数, 素数', src: 'number/1.html', date: '2024-06-07' },
          { title: '同余', src: 'number/2.html', date: '2024-06-06' },
          { title: '阶与原根', src: 'number/3.html', date: '2022-01-12' },
          { title: '二次剩余', src: 'number/4.html', date: '2022-01-09' },
          { title: '不定方程', src: 'number/5.html', date: '2023-09-22' },
          { title: '积性数论函数', src: 'number/6.html', date: '2022-03-09' },
          { title: '素数分布', src: 'number/7.html', date: '2022-03-30' },
          { title: '代数数域和代数整数', src: 'number/11.html', date: '2022-03-05' },
          { title: '理想的分解', src: 'number/12.html', date: '2022-05-14' },
        ]
      },
      {
        title: '集合论与点集拓扑',
        articles: [
          //      {title:'数理逻辑初步', src:'set/1.html'},
          { title: '集合及其运算', src: 'set/2.html' },
          { title: '二元关系与映射', src: 'set/3.html', date: '2024-06-27' },
          { title: '自然数', src: 'set/4.html' },
          { title: '基数', src: 'set/6.html' },
          { title: 'Lambda 表达式', src: 'set/7.html', date: '2023-01-07' },
          { title: '范畴论基础', src: 'set/8.html', date: '2024-06-12' },
        ]
      },
      {
        title: '复变函数',
        articles: [
          { title: '复数与复变函数', src: 'complex/1.html' },
          { title: '全纯函数', src: 'complex/2.html' },
          { title: '复变函数的展开', src: 'complex/3.html', date: '2022-01-21' },
          { title: '积分变换', src: 'complex/6.html', date: '2022-05-21' },
        ]
      },
      {
        title: '实变函数',
        articles: [
          { title: '预备知识', src: 'real/1.html' },
          { title: 'Lebesgue 测度', src: 'real/2.html', date: '2023-06-27' },
          { title: '可测函数', src: 'real/3.html', date: '2023-07-23' },
          { title: 'Lebesgue 积分', src: 'real/4.html', date: '2023-07-29' },
        ]
      },
      {
        title: '概率论',
        articles: [
          { title: '事件与概率', src: 'prob/1.html' },
          { title: '随机变量', src: 'prob/2.html', date: '2023-05-31' },
          { title: '极限定理', src: 'prob/4.html', date: '2021-12-14' },
          { title: '常用分布', src: 'prob/5.html' },
        ]
      },
      {
        title: '数理统计',
        articles: [
          { title: '数理统计的基本概念', src: 'stat/1.html', date: '2021-12-13' },
          { title: '参数估计与假设检验', src: 'stat/2.html' },
        ]
      },
      {
        title: '数值分析',
        articles: [
          { title: '插值与样条', src: 'numeric/2.html', date: '2023-10-16' },
          { title: '线性方程组', src: 'numeric/5.html' },
          { title: '矩阵', src: 'numeric/6.html' },
          { title: '非线性方程数值解法', src: 'numeric/7.html' },
          { title: '常微分方程数值解法', src: 'numeric/8.html' },
          { title: '偏微分方程的 Ritz-Galerkin 方法', src: 'numeric/9.html' },
        ]
      },
      {
        title: '泛函分析',
        articles: [
          { title: '度量空间', src: 'functional/1.html' },
          { title: '线性赋范空间', src: 'functional/2.html' },
          { title: '有界线性算子', src: 'functional/3.html' },
          { title: 'Hilbert 空间及其上的有界线性算子', src: 'functional/4.html' },
        ]
      },
      {
        title: '抽象代数',
        articles: [
          { title: '群 (上)', src: 'algebra/2.html', date: '2021-12-22' },
          { title: '群 (中)', src: 'algebra/3.html', date: '2024-04-17' },
          { title: '群 (下)', src: 'algebra/4.html', date: '2023-05-16' },
          { title: '环', src: 'algebra/5.html' },
          { title: '模', src: 'algebra/6.html', date: '2024-05-07' },
          { title: '域', src: 'algebra/7.html', date: '2024-06-30' },
          { title: 'Galois 理论', src: 'algebra/8.html', date: '2022-01-02' },
        ]
      },
      {
        title: '李群与李代数',
        articles: [
          { title: '矩阵李群', src: 'lie/0.html', date: '2023-12-20' },
          { title: '李代数初步', src: 'lie/1.html', date: '2023-10-17' },
        ]
      },
      {
        title: '拓扑学',
        articles: [
          { title: '拓扑空间与连续映射', src: 'topology/1.html', date: '2023-05-11' },
          { title: '分离性、可数性、紧致性、连通性', src: 'topology/2.html', date: '2023-05-14' },
        ]
      },
      {
        title: '常微分方程',
        articles: [
          { title: '一阶微分方程的初等解法', src: 'ode/2.html' },
          { title: '高阶微分方程', src: 'ode/4.html', date: '2022-02-07' },
          { title: '线性微分方程组', src: 'ode/5.html' },
        ]
      },
      {
        title: '偏微分方程',
        articles: [
          { title: '方程的导出', src: 'pde/1.html' },
          { title: '波动方程', src: 'pde/2.html' },
          { title: '热传导方程', src: 'pde/3.html' },
          { title: '位势方程', src: 'pde/4.html' },
          { title: '二阶线性偏微分方程的分类', src: 'pde/5.html' },
        ]
      },
      {
        title: '平面几何',
        articles: [
          { title: '五组公理', src: 'geometry/1.html' },
          { title: '三角形, 四边形', src: 'geometry/3.html', date: '2022-02-14' },
          { title: '圆', src: 'geometry/4.html', date: '2024-04-25' },
          { title: '抛物线', src: 'geometry/5.html' },
          { title: '射影几何', src: 'geometry/10.html', date: '2023-07-11' },
        ]
      },
      {
        title: '解析几何',
        articles: [
          { title: '向量与坐标系', src: 'analytic-geo/1.html', date: '2023-05-08' },
          { title: '平面与直线', src: 'analytic-geo/2.html', date: '2024-04-29' },
          { title: '圆锥曲线与二次曲面', src: 'analytic-geo/3.html', date: '2024-04-24' },
          { title: '平面几何的复数解法', src: 'analytic-geo/6.html' },
        ]
      },
      {
        title: '微分几何',
        articles: [
          { title: '欧氏空间', src: 'diff-geo/1.html' },
          { title: '曲线的局部理论', src: 'diff-geo/2.html' },
          { title: '曲面的局部理论', src: 'diff-geo/3.html', date: '2023-07-28' },
          { title: '标架与曲面论基本定理', src: 'diff-geo/4.html' },
          { title: '曲面的内蕴几何学', src: 'diff-geo/5.html' },
        ]
      },
      {
        title: '代数几何',
        articles: [
          { title: '仿射簇', src: 'ag/1.html', date: '2022-10-18' },
        ]
      },
      {
        title: '运筹学',
        articles: [
          { title: '线性规划', src: 'or/1.html', date: '2021-12-24' },
          { title: '运输问题', src: 'or/2.html', date: '2023-04-23' },
        ]
      },
      {
        title: '组合数学',
        articles: [
          { title: '引言, 计数原理, 鸽巢原理', src: 'comb/1.html' },
          { title: '排列与组合', src: 'comb/2.html', date: '2022-01-15' },
          { title: '求解递推式', src: 'comb/3.html', date: '2024-04-26' },
          { title: '容斥原理', src: 'comb/4.html' },
          { title: '离散微积分与特殊计数序列', src: 'comb/5.html', date: '2023-05-15' },
          { title: '生成函数', src: 'comb/6.html', date: '2022-01-22' },
        ]
      },
      {
        title: '图论',
        articles: [
          { title: 'Paths and cycles', src: 'graph/2.html' },
        ]
      },
      {
        title: '数学游戏',
        articles: [
          { title: '数学游戏', src: 'recreation/1.html' },
        ]
      }
    ]
  },

  cs: {
    title: '计算机',
    color: 'blue',
    favicon: 'dango.png',
    toc: [
      {
        title: '数据结构与算法',
        articles: [
          { title: '习题', src: 'ds/exercise.html', date: '2021-11-22' },
          { title: '绪论', src: 'ds/1.html' },
          { title: '线性表', src: 'ds/2.html' },
          { title: '栈与队列', src: 'ds/3.html' },
          { title: '递归与回溯', src: 'ds/4.html', date: '2024-05-07' },
          { title: '字符串', src: 'ds/5.html', date: '2023-05-24' },
          { title: '树与二叉树', src: 'ds/6.html' },
          { title: '矩阵与广义表', src: 'ds/7.html' },
          { title: '图', src: 'ds/8.html' },
          { title: '查找', src: 'ds/9.html', date: '2021-11-24' },
          { title: '随机算法', src: 'ds/10.html', date: '2023-09-05' },
          { title: '排序', src: 'ds/11.html', date: '2021-12-03' },
          { title: '文件', src: 'ds/12.html' },
          { title: '数论算法', src: 'ds/13.html', date: '2022-01-07' },
          { title: '动态规划与贪心算法', src: 'ds/14.html' },
          { title: '计算几何', src: 'ds/15.html', date: '2021-12-04' },
          { title: '算法题模板', src: 'ds/16.html', date: '2021-12-02' },
          { title: '硬件算法', src: 'ds/hardware.html', date: '2024-05-20' },
        ]
      },
      {
        title: '机器学习',
        articles: [
          { title: '机器学习基础', src: 'ml/1.html', date: '2024-04-20' },
        ]
      },
      {
        title: '操作系统',
        articles: [
          { title: '引论', src: 'os/1.html' },
          { title: '进程', src: 'os/2.html' },
          { title: '内存', src: 'os/3.html' },
        ]
      },
      {
        title: '计算机组成原理',
        articles: [
          { title: '计算机系统概论', src: 'com/1.html' },
        ]
      },
      {
        title: '数据库系统概论',
        articles: [
          { title: '绪论', src: 'db/1.html' },
          { title: '关系数据库', src: 'db/2.html' },
          { title: 'SQL', src: 'db/3.html' },
          { title: '数据库习题', src: 'db/exercise.html' },
        ]
      },
      {
        title: '计算机网络',
        articles: [
          { title: '概述', src: 'net/1.html' },
          { title: '物理层', src: 'net/2.html' },
        ]
      },
      {
        title: '工具',
        articles: [
          { title: 'svg 流程图', src: 'utils/svg-flowchart.html' },
          { title: '无奖竞猜', src: 'utils/exam.html' },
        ]
      }
    ]
  },

  physics: {
    title: '物理',
    color: 'purple',
    toc: [
      {
        title: '未分类',
        articles: [
          { title: '单位与数量', src: 'misc/1.html' },
          { title: '物理学家', src: 'misc/6.html' },
        ]
      },
      {
        title: '力学',
        articles: [
          { title: '质点运动学', src: 'mechanics/1.html' },
        ]
      },
      {
        title: '流体力学',
        articles: [
          { title: '流体力学基础', src: 'hydro/1.html', date: '2021-11-24' },
        ]
      },
      {
        title: '量子力学',
        articles: [
          { title: '波方程', src: 'quantum/1.html', date: '2024-01-16' },
        ],
      },
      {
        title: '光学',
        articles: [
          { title: '光学', src: 'optics/1.html' },
        ]
      },
      {
        title: '相对论',
        articles: [
          { title: '狭义相对论', src: 'relativity/1.html', date: '2022-04-18' },
        ]
      }
    ]
  },

  lang: {
    title: '语言',
    color: 'dark',
    toc: [
      {
        title: '汉语',
        articles: [
          { title: '易读错字词整理', src: 'zh/words.html' },
          { title: '打字练习', src: 'zh/typing.html', date: '2024-04-09' },
        ]
      },
      {
        title: '日语',
        articles: [
          { title: '学五十音', src: 'jp/kana.html' },
          { title: '日语动词', src: 'jp/words.html' },
        ]
      },
      {
        title: '歌词',
        articles: [
          { title: 'L\'arc~en~Ciel', src: 'lyric/larc~en~ciel.html' },
          { title: 'Crayon Shinchan', src: 'lyric/crayon-shinchan.html', date: '2022-02-27' },
          { title: 'MUCC', src: 'lyric/mucc.html', date: '2022-02-27' },
          { title: 'sadie', src: 'lyric/sadie.html', date: '2022-02-27' },
          { title: 'sekima', src: 'lyric/sekima.html', date: '2022-02-27' },
          { title: '张国荣', src: 'lyric/leslie-cheung.html', date: '2024-05-31' },
        ]
      },
      {
        title: '旧作',
        articles: [
          { title: '鸟人', src: 'sleepy/niaoren.html', date: '2022-02-26' },
        ]
      },
      {
        title: '未分类',
        articles: [
          { title: '盲文', src: 'misc/braille.html', date: '2023-05-10' },
          { title: '古典密码', src: 'misc/classical-cipher.html', date: '2023-08-15' },
        ]
      }
    ]
  },

  music: {
    title: '音乐',
    color: 'pink',
    toc: [
      {
        title: '工具',
        articles: [
          { title: '调音器', src: 'utils/tuner.html', date: '2024-04-13' },
          // { title: '播放器', src: 'utils/player.html', date: '2022-02-12' },
          // { title: '简谱', src: 'utils/jianpu.html' },
          // { title: '乐谱编辑器', src: 'utils/lywriter.html' },
          // { title: '练耳', src: 'utils/ear-training.html' },
          // { title: '键盘', src: 'utils/piano.html' },
          // { title: '乐谱', src: 'utils/svg-score.html' },
        ]
      }
    ]
  },

  exercise: {
    title: '习题',
    toc: [
      {
        title: '高等代数',
        articles: [
          { title: '第0章 整数，数域与多项式', src: 'linalg/0.html' },
          //{title:'引言1 线性方程组，消元解法及其在增广矩阵上的实现', src:'linalg/intro1.html'},
          //{title:'第1章 矩阵代数', src:'linalg/1.html'},
          //{title:'第2章 一类特殊线性方程组的行列式法则 (Cramer法则)', src:'linalg/2.html'},
          //{title:'第3章 线性方程组的一般理论', src:'linalg/3.html'},
          //{title:'第4章 线性空间与线性方程组', src:'linalg/4.html'},
          //{title:'第5章 对称双线性度量空间与线性方程组', src:'linalg/5.html'},
          //{title:'引言2 二次型主轴问题的几何原型', src:'linalg/intro2.html'},
          //{title:'第6章 线性空间上的线性变换', src:'linalg/6.html'},
          //{title:'第7章 线性空间关于线性变换的一类直和分解', src:'linalg/7.html'},
          //{title:'第8章 Euclid 空间上的两类变换与二次型主轴问题', src:'linalg/8.html'},
          //{title:'第9章 引申——一般矩阵的 (相似) 标准形', src:'linalg/9.html'},
        ]
      },
      {
        title: '数学分析',
        articles: [
          // 实数域和初等函数
          { title: '实数的运算与序', src: 'analysis/1-1.html' },
          { title: '实数域的完备性', src: 'analysis/1-2.html' },
          { title: '初等函数', src: 'analysis/1-3.html' },
          // 数列的极限
          { title: '数列极限的定义', src: 'analysis/2-1.html' },
          { title: '数列极限的性质', src: 'analysis/2-2.html' },
          { title: '趋于无穷的数列和三个记号', src: 'analysis/2-3.html' },
          { title: '几个重要的定理', src: 'analysis/2-4.html' },
          { title: '上极限和下极限', src: 'analysis/2-5.html' },
          // 函数的极限和连续性
          { title: '函数的极限', src: 'analysis/3-1.html' },
          { title: '函数的极限(续)', src: 'analysis/3-2.html' },
          { title: '函数的连续性', src: 'analysis/3-3.html' },
          { title: '连续函数的性质', src: 'analysis/3-4.html' },
          // 函数的导数
          { title: '导数的定义', src: 'analysis/4-1.html' },
          { title: '复合函数与反函数的导数', src: 'analysis/4-2.html' },
          { title: '函数的微分', src: 'analysis/4-3.html' },
          { title: '高阶导数', src: 'analysis/4-4.html' },
          { title: '向量函数的导数', src: 'analysis/4-5.html' },
          // 导数的应用
          { title: '微分中值定理', src: 'analysis/5-1.html' },
          { title: '洛必达法则', src: 'analysis/5-2.html' },
          { title: '利用导数判定两个函数相等', src: 'analysis/5-3.html' },
          { title: '函数的增减性与极值', src: 'analysis/5-4.html' },
          { title: '函数的凹凸性', src: 'analysis/5-5.html' },
          { title: '泰勒公式', src: 'analysis/5-6.html' },
          { title: '方程求根的牛顿迭代公式', src: 'analysis/5-7.html' },
          { title: '函数的作图', src: 'analysis/5-8.html' },
          // 不定积分
          { title: '原函数与不定积分', src: 'analysis/6-1.html' },
          { title: '换元积分法和分部积分法', src: 'analysis/6-2.html' },
          { title: '几类初等函数的积分', src: 'analysis/6-3.html' },
          // 定积分
          { title: '定积分的概念和基本性质', src: 'analysis/7-1.html' },
          { title: '定积分的计算', src: 'analysis/7-2.html' },
          //{title:'连续函数的可积性', src:'analysis/7-3.html'},
          //{title:'函数可积的达布准则', src:'analysis/7-4.html'},
          // 定积分的应用
          { title: '定积分在分析学中的应用', src: 'analysis/8-1.html' },
          //{title:'定积分在几何学中的应用', src:'analysis/8-2.html'},
          //{title:'定积分在物理学中的应用', src:'analysis/8-3.html'},
          // 广义积分
          { title: '无穷积分', src: 'analysis/9-1.html' },
          //{title:'瑕积分', src:'analysis/9-2.html'},
          //{title:'一些定积分公式的推广', src:'analysis/9-3.html'},
          // 无穷级数
          //{title:'无穷级数的基本概念', src:'analysis/10-1.html'},
          //{title:'正项级数', src:'analysis/10-2.html'},
          //{title:'任意项级数', src:'analysis/10-3.html'},
          //{title:'级数的代数运算', src:'analysis/10-4.html'},
          //{title:'零测集和勒贝格定理', src:'analysis/10-5.html'},
          // 函数序列和函数级数
          //{title:'函数序列的一致收敛', src:'analysis/11-1.html'},
          //{title:'魏尔斯特拉斯逼近定理和阿尔采拉－阿斯科利定理', src:'analysis/11-2.html'},
          //{title:'函数序列的积分平均收敛', src:'analysis/11-3.html'},
          //{title:'函数级数', src:'analysis/11-4.html'},
          // 幂级数
          //{title:'幂级数的收敛区域', src:'analysis/12-1.html'},
          //{title:'和函数的性质', src:'analysis/12-2.html'},
          //{title:'函数的幂级数展开', src:'analysis/12-3.html'},
          // 傅里叶级数
          //{title:'函数的傅里叶级数', src:'analysis/13-1.html'},
          //{title:'傅里叶级数收敛的条件', src:'analysis/13-2.html'},
          //{title:'傅里叶级数的性质', src:'analysis/13-3.html'},
          //{title:'傅里叶级数的积分平均收敛', src:'analysis/13-4.html'},
          //{title:'有限区间上的傅里叶展开', src:'analysis/13-5.html'},
          // 多元函数的极限和连续性
          { title: '`RR^m` 中的点列和点集', src: 'analysis/14-1.html' },
          //{title:'多元函数的概念', src:'analysis/14-2.html'},
          //{title:'多元函数的极限', src:'analysis/14-3.html'},
          //{title:'多元连续函数', src:'analysis/14-4.html'},
          // 多元数量函数的微分学
          //{title:'偏导数和全微分', src:'analysis/15-1.html'},
          //{title:'方向导数和梯度', src:'analysis/15-2.html'},
          //{title:'复合函数的偏导数和隐函数定理', src:'analysis/15-3.html'},
          //{title:'高阶偏导数和泰勒公式', src:'analysis/15-4.html'},
          //{title:'微分学的几何应用', src:'analysis/15-5.html'},
          // 多元向量函数的微分学
          //{title:'线性变换与矩阵分析初步', src:'analysis/16-1.html'},
          //{title:'多元向量函数的偏导数与全微分', src:'analysis/16-2.html'},
          //{title:'隐函数定理和反函数定理', src:'analysis/16-3.html'},
          // 多元函数的极值
          //{title:'简单极值问题', src:'analysis/17-1.html'},
          //{title:'条件极值问题', src:'analysis/17-2.html'},
          // 含参变量的积分
          //{title:'含参变量的定积分', src:'analysis/18-1.html'},
          //{title:'含参变量的广义积分', src:'analysis/18-2.html'},
          //{title:'欧拉积分', src:'analysis/18-3.html'},
          // 重积分
          //{title:'`RR^m` 中点集的若尔当测度', src:'analysis/19-1.html'},
          //{title:'重积分的定义和性质', src:'analysis/19-2.html'},
          //{title:'重积分的计算', src:'analysis/19-3.html'},
          //{title:'重积分的变元变换', src:'analysis/19-4.html'},
          //{title:'曲面的面积', src:'analysis/19-5.html'},
          //{title:'重积分的物理应用', src:'analysis/19-6.html'},
          // 曲线积分和曲面积分
          //{title:'第一型曲线积分和曲面积分', src:'analysis/20-1.html'},
          //{title:'第二型曲线积分和曲面积分', src:'analysis/20-2.html'},
          //{title:'三个重要公式', src:'analysis/20-3.html'},
          // 广义重积分和含参变量的重积分
          //{title:'广义重积分和含参变量的重积分', src:'analysis/21-1.html'},
          //{title:'函数的磨光及其应用', src:'analysis/21-2.html'},
          // 场论初步
          //{title:'关于场的基本概念', src:'analysis/22-1.html'},
          //{title:'向量场的通量和散度', src:'analysis/22-2.html'},
          //{title:'向量场的环量和旋度', src:'analysis/22-3.html'},
          //{title:'一些重要定理', src:'analysis/22-4.html'},
          //{title:'平面和曲面上的向量场', src:'analysis/22-5.html'},
          // 微分形式和斯托克斯公式
          //{title:'反对称多线性函数和外积', src:'analysis/23-1.html'},
          //{title:'微分形式和外微分', src:'analysis/23-2.html'},
          //{title:'微分形式的变元变换和积分', src:'analysis/23-3.html'},
          //{title:'斯托克斯公式', src:'analysis/23-4.html'},
          // 综合习题
          { title: '综合习题一', src: 'analysis/final-1.html' },
          //{title:'综合习题二', src:'analysis/final-2.html'},
          //{title:'综合习题三', src:'analysis/final-3.html'},
        ]
      },
      {
        title: '抽象代数',
        articles: [
          { title: '集合论的基本概念', src: 'algebra/1.html' },
          { title: '抽象代数的基本概念', src: 'algebra/2.html' },
        ]
      },
      {
        title: '实变函数',
        articles: [
          // 集合与点集
          { title: '集合的运算', src: 'real/1-2.html' },
          { title: '映射与基数', src: 'real/1-3.html' },
          { title: '`RR^n` 中的度量, 点集的极限点', src: 'real/1-4.html' },
          { title: '闭集, 开集, Borel 集, Cantor 集', src: 'real/1-5.html' },
        ]
      },
      {
        title: '算法导论',
        articles: [
          { title: '算法基础', src: 'algorithm/2.html' },
          { title: '分治策略', src: 'algorithm/4.html' },
        ]
      },
    ]
  },
  // 全新的开始?
};
if (typeof module !== 'undefined') {
  module.exports = tocData;
}
