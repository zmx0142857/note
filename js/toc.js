var tocData = [
  {
    "value": "math",
    "label": "数学",
    "color": "yellow",
    "favicon": "pikachu.png",
    "children": [
      {
        "value": "example",
        "label": "示例",
        "children": [
          { "value": "editor", "label": "公式编辑器", "date": "2022-01-12" },
          { "value": "mathml", "label": "Mathml" },
          { "value": "surface", "label": "曲面在线绘制", "date": "2021-12-10" },
          { "value": "knot", "label": "纽结编辑器", "date": "2025-01-07" },
          { "value": "geometry", "label": "几何编辑器", "date": "2025-02-07" },
        ]
      },
      {
        "value": "misc",
        "label": "未分类",
        "children": [
          { "value": "0", "label": "问题", "date": "2022-02-16" },
          { "value": "2", "label": "三角函数", "date": "2025-06-10" },
          { "value": "3", "label": "不等式", "date": "2025-05-24" },
          { "value": "4", "label": "微积分不等式", "date": "2024-12-03" },
          { "value": "5", "label": "因式分解", "date": "2022-09-18" },
          { "value": "6", "label": "数学家", "date": "2022-08-29" },
          { "value": "7", "label": "算术与进制", "date": "2022-02-06" }
        ]
      },
      {
        "value": "linalg",
        "label": "高等代数",
        "children": [
          { "value": "0", "label": "初等代数", "date": "2024-09-21" },
          { "value": "1", "label": "矩阵", "date": "2024-12-19" },
          { "value": "2", "label": "行列式", "date": "2024-10-24" },
          { "value": "3", "label": "向量的相关性与线性方程组", "date": "2021-12-14" },
          { "value": "4", "label": "线性空间" },
          { "value": "5", "label": "线性映射与线性变换", "date": "2024-12-26" },
          { "value": "6", "label": "特征值与特征向量", "date": "2024-12-12" },
          { "value": "7", "label": "λ 矩阵与相似标准形", "date": "2023-06-01" },
          { "value": "8", "label": "线性空间中的度量与内积", "date": "2024-04-12" },
          { "value": "9", "label": "实二次型与正定矩阵", "date": "2024-04-11" },
          { "value": "10", "label": "张量初步", "date": "2024-12-26" }
        ]
      },
      {
        "value": "analysis",
        "label": "数学分析",
        "children": [
          { "value": "0", "label": "附录", "date": "2022-04-24" },
          { "value": "1", "label": "初等函数" },
          { "value": "2", "label": "数列的极限", "date": "2024-09-25" },
          { "value": "3", "label": "函数的极限与连续性", "date": "2022-03-04" },
          { "value": "5", "label": "导数的应用", "date": "2023-10-09" },
          { "value": "6", "label": "不定积分", "date": "2022-04-10" },
          { "value": "7", "label": "定积分与广义积分", "date": "2024-12-09" },
          { "value": "8", "label": "特殊函数 (1): Gamma 函数, Euler 和, 指对数积分", "date": "2022-05-15" },
          { "value": "9", "label": "特殊函数 (2): 椭圆函数, 超几何函数, Bessel 函数", "date": "2024-11-06" },
          { "value": "10", "label": "特殊函数 (3): Bernoulli 数与 Riemann zeta 函数", "date": "2024-07-31" },
          { "value": "11", "label": "常数项级数", "date": "2024-10-28" },
          { "value": "12", "label": "函数列与函数项级数" },
          { "value": "13", "label": "Fourier 级数" },
          { "value": "14", "label": "多元函数的极限与连续性" },
          { "value": "15", "label": "多元函数微分学", "date": "2022-12-01" },
          { "value": "17", "label": "多元函数的极值" },
          { "value": "19", "label": "重积分" },
          { "value": "22", "label": "场论初步", "date": "2025-03-22" },
          { "value": "23", "label": "分数阶微积分" },
          { "value": "24", "label": "函数方程" }
        ]
      },
      {
        "value": "number",
        "label": "数论",
        "children": [
          { "value": "0", "label": "整数, 有理数, 代数数, 连分数", "date": "2025-06-11" },
          { "value": "1", "label": "整除, 最大公约数, 素数", "date": "2024-06-07" },
          { "value": "2", "label": "同余", "date": "2024-06-06" },
          { "value": "3", "label": "阶与原根", "date": "2025-01-08" },
          { "value": "4", "label": "二次剩余", "date": "2022-01-09" },
          { "value": "5", "label": "不定方程", "date": "2024-12-31" },
          { "value": "6", "label": "积性数论函数", "date": "2024-08-30" },
          { "value": "7", "label": "素数分布", "date": "2022-11-20" },
          { "value": "11", "label": "代数数域和代数整数", "date": "2022-03-05" },
          { "value": "12", "label": "理想的分解", "date": "2022-05-14" }
        ]
      },
      {
        "value": "set",
        "label": "集合论",
        "children": [
          { "value": "2", "label": "集合及其运算", "date": "2025-06-06" },
          { "value": "3", "label": "二元关系与映射", "date": "2024-10-29" },
          { "value": "4", "label": "自然数与序数", "date": "2024-12-26" },
          { "value": "5", "label": "基数", "date": "2024-09-28" },
          { "value": "6", "label": "类型论", "date": "2024-10-08" },
          { "value": "7", "label": "Lambda 表达式", "date": "2023-01-07" },
          { "value": "8", "label": "范畴论基础", "date": "2024-12-28" }
        ]
      },
      {
        "value": "complex",
        "label": "复变函数",
        "children": [
          { "value": "1", "label": "复数与复变函数" },
          { "value": "2", "label": "全纯函数" },
          { "value": "3", "label": "复变函数的展开", "date": "2022-01-21" },
          { "value": "6", "label": "积分变换", "date": "2022-05-21" }
        ]
      },
      {
        "value": "real",
        "label": "实变函数",
        "children": [
          { "value": "1", "label": "预备知识" },
          { "value": "2", "label": "Lebesgue 测度", "date": "2023-06-27" },
          { "value": "3", "label": "可测函数", "date": "2023-07-23" },
          { "value": "4", "label": "Lebesgue 积分", "date": "2023-07-29" }
        ]
      },
      {
        "value": "prob",
        "label": "概率论",
        "children": [
          { "value": "1", "label": "事件与概率" },
          { "value": "2", "label": "随机变量", "date": "2024-09-04" },
          { "value": "4", "label": "极限定理", "date": "2021-12-14" },
          { "value": "5", "label": "常用分布" }
        ]
      },
      {
        "value": "stat",
        "label": "数理统计",
        "children": [
          { "value": "1", "label": "数理统计的基本概念", "date": "2021-12-13" },
          { "value": "2", "label": "参数估计与假设检验" }
        ]
      },
      {
        "value": "numeric",
        "label": "数值分析",
        "children": [
          { "value": "2", "label": "插值与样条", "date": "2024-12-30" },
          { "value": "5", "label": "线性方程组" },
          { "value": "6", "label": "矩阵" },
          { "value": "7", "label": "非线性方程数值解法" },
          { "value": "8", "label": "常微分方程数值解法" },
          { "value": "9", "label": "偏微分方程的 Ritz-Galerkin 方法" }
        ]
      },
      {
        "value": "functional",
        "label": "泛函分析",
        "children": [
          { "value": "1", "label": "度量空间", "date": "2025-06-12" },
          { "value": "2", "label": "赋范线性空间", "date": "2025-06-13" },
          // { "value": "3", "label": "有界线性算子" },
          // { "value": "4", "label": "Hilbert 空间及其上的有界线性算子" }
        ]
      },
      {
        "value": "algebra",
        "label": "抽象代数",
        "children": [
          { "value": "2", "label": "群 (上)", "date": "2024-07-06" },
          { "value": "3", "label": "群 (中)", "date": "2024-12-11" },
          { "value": "4", "label": "群 (下)", "date": "2025-01-10" },
          { "value": "5", "label": "环" },
          { "value": "6", "label": "模与代数", "date": "2024-10-29" },
          { "value": "7", "label": "域", "date": "2024-06-30" },
          { "value": "8", "label": "Galois 理论", "date": "2022-01-02" },
          { "value": "10", "label": "有限群表示论", "date": "2024-12-14" },
        ]
      },
      {
        "value": "lie",
        "label": "李群与李代数",
        "children": [
          { "value": "0", "label": "矩阵李群", "date": "2023-12-20" },
          { "value": "1", "label": "李代数初步", "date": "2024-09-23" }
        ]
      },
      {
        "value": "topo",
        "label": "拓扑学",
        "children": [
          { "value": "1", "label": "拓扑空间与连续映射", "date": "2023-05-11" },
          { "value": "2", "label": "常见拓扑性质", "date": "2024-10-19" },
          { "value": "3", "label": "滤子和网", "date": "2024-10-31" },
          { "value": "10", "label": "纽结理论", "date": "2025-01-14" },
        ]
      },
      {
        "value": "ode",
        "label": "常微分方程",
        "children": [
          { "value": "1", "label": "常微分方程初等解法", "date": "2025-03-20" },
          { "value": "2", "label": "线性方程", "date": "2025-03-26" },
        ]
      },
      {
        "value": "pde",
        "label": "偏微分方程",
        "children": [
          { "value": "1", "label": "方程的导出" },
          { "value": "2", "label": "波动方程" },
          { "value": "3", "label": "热传导方程" },
          { "value": "4", "label": "位势方程" },
          { "value": "5", "label": "二阶线性偏微分方程的分类" }
        ]
      },
      {
        "value": "geometry",
        "label": "平面几何",
        "children": [
          { "value": "1", "label": "五组公理" },
          { "value": "3", "label": "三角形, 四边形", "date": "2022-02-14" },
          { "value": "4", "label": "圆", "date": "2024-10-30" },
          { "value": "5", "label": "抛物线" },
          { "value": "6", "label": "椭圆与双曲线", "date": "2024-11-04" },
          { "value": "7", "label": "球面几何", "date": "2024-10-23" },
          { "value": "10", "label": "射影几何", "date": "2023-07-11" },
        ]
      },
      {
        "value": "analytic-geo",
        "label": "解析几何",
        "children": [
          { "value": "1", "label": "向量与坐标系", "date": "2024-10-21" },
          { "value": "2", "label": "平面与直线", "date": "2024-04-29" },
          { "value": "3", "label": "圆锥曲线与二次曲面", "date": "2024-04-24" },
          { "value": "4", "label": "平面代数曲线", "date": "2024-09-10" },
          { "value": "6", "label": "平面几何的复数解法" }
        ]
      },
      {
        "value": "diff-geo",
        "label": "微分几何",
        "children": [
          { "value": "1", "label": "欧氏空间" },
          { "value": "2", "label": "曲线的局部理论", "date": "2024-11-01" },
          { "value": "3", "label": "曲面的局部理论", "date": "2024-10-24" },
          { "value": "4", "label": "标架与曲面论基本定理" },
          { "value": "5", "label": "曲面的内蕴几何学" }
        ]
      },
      {
        "value": "ag",
        "label": "代数几何",
        "children": [
          { "value": "1", "label": "仿射簇", "date": "2022-10-18" }
        ]
      },
      {
        "value": "or",
        "label": "运筹学",
        "children": [
          { "value": "1", "label": "线性规划", "date": "2021-12-24" },
          { "value": "2", "label": "运输问题", "date": "2023-04-23" }
        ]
      },
      {
        "value": "comb",
        "label": "组合数学",
        "children": [
          { "value": "1", "label": "引言, 计数原理, 鸽巢原理" },
          { "value": "2", "label": "排列与组合", "date": "2022-01-15" },
          { "value": "3", "label": "求解递推式", "date": "2024-04-26" },
          { "value": "4", "label": "容斥原理" },
          { "value": "5", "label": "离散微积分与常见计数序列", "date": "2025-06-05" },
          { "value": "6", "label": "生成函数", "date": "2024-12-12" }
        ]
      },
      {
        "value": "graph",
        "label": "图论",
        "children": [
          { "value": "2", "label": "Paths and cycles" }
        ]
      },
      {
        "value": "recreation",
        "label": "数学游戏",
        "children": [
          { "value": "1", "label": "数学游戏", "date": "2024-12-12" },
          { "value": "2", "label": "家庭理财", "date": "2025-05-15" }
        ]
      }
    ]
  },
  {
    "value": "cs",
    "label": "计算机",
    "color": "blue",
    "favicon": "dango.png",
    "children": [
      {
        "value": "ds",
        "label": "数据结构与算法",
        "children": [
          { "value": "exercise", "label": "习题", "date": "2024-10-24" },
          { "value": "1", "label": "绪论" },
          { "value": "2", "label": "线性表" },
          { "value": "3", "label": "栈与队列" },
          { "value": "4", "label": "递归与回溯", "date": "2024-05-07" },
          { "value": "5", "label": "字符串", "date": "2023-05-24" },
          { "value": "6", "label": "树与二叉树" },
          { "value": "7", "label": "矩阵与广义表" },
          { "value": "8", "label": "图" },
          { "value": "9", "label": "查找", "date": "2021-11-24" },
          { "value": "10", "label": "随机算法", "date": "2024-07-24" },
          { "value": "11", "label": "排序", "date": "2021-12-03" },
          { "value": "12", "label": "文件" },
          { "value": "13", "label": "数论算法", "date": "2022-01-07" },
          { "value": "14", "label": "动态规划与贪心算法" },
          { "value": "15", "label": "计算几何", "date": "2025-01-10" },
          { "value": "16", "label": "算法题模板", "date": "2021-12-02" },
          { "value": "hardware", "label": "硬件算法", "date": "2024-05-20" }
        ]
      },
      {
        "value": "ml",
        "label": "机器学习",
        "children": [
          { "value": "1", "label": "机器学习基础", "date": "2024-07-29" }
        ]
      },
      {
        "value": "os",
        "label": "操作系统",
        "children": [
          { "value": "1", "label": "引论" },
          { "value": "2", "label": "进程" },
          { "value": "3", "label": "内存" }
        ]
      },
      {
        "value": "com",
        "label": "计算机组成原理",
        "children": [
          { "value": "1", "label": "计算机系统概论" }
        ]
      },
      {
        "value": "db",
        "label": "数据库系统概论",
        "children": [
          { "value": "1", "label": "绪论" },
          { "value": "2", "label": "关系数据库" },
          { "value": "3", "label": "SQL" },
          { "value": "exercise", "label": "数据库习题" }
        ]
      },
      {
        "value": "net",
        "label": "计算机网络",
        "children": [
          { "value": "1", "label": "概述" },
          { "value": "2", "label": "物理层" }
        ]
      },
      {
        "value": "utils",
        "label": "工具",
        "children": [
          { "value": "svg-flowchart", "label": "svg 流程图" },
          { "value": "exam", "label": "无奖竞猜" }
        ]
      }
    ]
  },
  {
    "value": "physics",
    "label": "物理",
    "color": "purple",
    "children": [
      {
        "value": "misc",
        "label": "未分类",
        "children": [
          { "value": "1", "label": "单位与数量" },
          { "value": "6", "label": "物理学家" }
        ]
      },
      {
        "value": "mechanics",
        "label": "力学",
        "children": [
          { "value": "1", "label": "质点运动学", "date": "2024-09-13" }
        ]
      },
      {
        "value": "elemag",
        "label": "电磁学",
        "children": [
          { "value": "1", "label": "麦克斯韦方程组", "date": "2025-03-21" }
        ]
      },
      {
        "value": "hydro",
        "label": "流体力学",
        "children": [
          { "value": "1", "label": "流体力学基础", "date": "2021-11-24" }
        ]
      },
      {
        "value": "quantum",
        "label": "量子力学",
        "children": [
          { "value": "1", "label": "波方程", "date": "2024-01-16" }
        ]
      },
      {
        "value": "optics",
        "label": "光学",
        "children": [
          { "value": "1", "label": "光学" }
        ]
      },
      {
        "value": "relativity",
        "label": "相对论",
        "children": [
          { "value": "1", "label": "狭义相对论", "date": "2022-04-18" }
        ]
      }
    ]
  },
  {
    "value": "lang",
    "label": "语言",
    "color": "dark",
    "children": [
      {
        "value": "zh",
        "label": "汉语",
        "children": [
          { "value": "words", "label": "易读错字词整理" },
          { "value": "typing", "label": "打字练习", "date": "2024-04-09" },
          { "value": "hinghwa", "label": "莆仙话", "date": "2024-07-23" }
        ]
      },
      {
        "value": "jp",
        "label": "日语",
        "children": [
          { "value": "kana", "label": "学五十音" },
          { "value": "words", "label": "日语动词" }
        ]
      },
      {
        "value": "lyric",
        "label": "歌词",
        "children": [
          { "value": "larc~en~ciel", "label": "L'arc~en~Ciel" },
          { "value": "crayon-shinchan", "label": "Crayon Shinchan", "date": "2022-02-27" },
          { "value": "mucc", "label": "MUCC", "date": "2022-02-27" },
          { "value": "sadie", "label": "Sadie", "date": "2022-02-27" },
          { "value": "sekima", "label": "聖飢魔II", "date": "2022-02-27" },
          { "value": "leslie-cheung", "label": "张国荣", "date": "2024-05-31" },
          { "value": "xjapan", "label": "X JAPAN", "date": "2024-09-27" },
          { "value": "galneryus", "label": "Galneryus", "date": "2024-11-01" }
        ]
      },
      {
        "value": "sleepy",
        "label": "旧作",
        "children": [
          { "value": "niaoren.md", "label": "鸟人", "date": "2022-02-26" },
          // { "value": "lidaodianbo.md", "label": "离岛电波", "date": "2022-02-26" },
        ]
      },
      {
        "value": "misc",
        "label": "未分类",
        "children": [
          { "value": "classical-cipher", "label": "古典密码", "date": "2024-09-07" },
          { "value": "pic-bench", "label": "拼图工作台", "date": "2024-09-09" },
          { "value": "braille", "label": "盲文", "date": "2023-05-10" },
        ]
      }
    ]
  },
  {
    "value": "music",
    "label": "音乐",
    "color": "pink",
    "children": [
      {
        "value": "utils",
        "label": "工具",
        "children": [
          { "value": "tuner", "label": "调音器", "date": "2024-04-13" },
          { "value": "piano", "label": "钢琴", "date": "2024-11-16" },
          // { "value": "player", "label": '播放器', "date": "2022-02-12" },
          // { "value": "jianpu", "label": '简谱' },
          // { "value": "lywriter", "label": '乐谱编辑器' },
          // { "value": "ear-training", "label": '练耳' },
          // { "value": "svg-score", "label": '乐谱' },
        ]
      },
      {
        "value": "theory",
        "label": "乐理",
        "children": [
          { "value": "1", "label": "Euler 音乐理论", "date": "2025-01-25" }
        ]
      },
      {
        "value": "guitar",
        "label": "吉他",
        "children": [
          { "value": "1.alphatex", "label": "Глас Сумеречных Озёр", "date": "2025-03-22" },
          { "value": "春夏秋冬.alphatex", "label": "春夏秋冬", "date": "2025-03-22" },
          { "value": "radical-dreamer.alphatex", "label": "Radical Dreamer", "date": "2025-03-23" },
          { "value": "rusty-nail.alphatex", "label": "Rusty Nail", "date": "2025-06-06" },
          { "value": "杀死那个石家庄人.alphatex", "label": "杀死那个石家庄人", "date": "2025-06-06" },
        ],
      },
    ]
  },
  {
    "value": "exercise",
    "label": "习题",
    "children": [
      {
        "value": "linalg",
        "label": "高等代数",
        "children": [
          { "value": "0", "label": "第0章 整数，数域与多项式" }
          // { "value": "intro1", "label": "引言1 线性方程组，消元解法及其在增广矩阵上的实现" },
          // { "value": "1", "label": "第1章 矩阵代数" }
          // { "value": "2", "label": "第2章 一类特殊线性方程组的行列式法则 (Cramer法则)" },
          // { "value": "3", "label": "第3章 线性方程组的一般理论" },
          // { "value": "4", "label": "第4章 线性空间与线性方程组" },
          // { "value": "5", "label": "第5章 对称双线性度量空间与线性方程组" },
          // { "value": "intro2", "label": "引言2 二次型主轴问题的几何原型" },
          // { "value": "6", "label": "第6章 线性空间上的线性变换" },
          // { "value": "7", "label": "第7章 线性空间关于线性变换的一类直和分解" },
          // { "value": "8", "label": "第8章 Euclid 空间上的两类变换与二次型主轴问题" },
          // { "value": "9", "label": "第9章 引申——一般矩阵的 (相似) 标准形" },
        ]
      },
      {
        "value": "analysis",
        "label": "数学分析",
        "children": [
          // 实数域和初等函数
          { "value": "1-1", "label": "实数的运算与序" },
          { "value": "1-2", "label": "实数域的完备性" },
          { "value": "1-3", "label": "初等函数" },
          // 数列的极限
          { "value": "2-1", "label": "数列极限的定义" },
          { "value": "2-2", "label": "数列极限的性质" },
          { "value": "2-3", "label": "趋于无穷的数列和三个记号" },
          { "value": "2-4", "label": "几个重要的定理" },
          { "value": "2-5", "label": "上极限和下极限" },
          // 函数的极限和连续性
          { "value": "3-1", "label": "函数的极限" },
          { "value": "3-2", "label": "函数的极限(续)" },
          { "value": "3-3", "label": "函数的连续性" },
          { "value": "3-4", "label": "连续函数的性质" },
          // 函数的导数
          { "value": "4-1", "label": "导数的定义" },
          { "value": "4-2", "label": "复合函数与反函数的导数" },
          { "value": "4-3", "label": "函数的微分" },
          { "value": "4-4", "label": "高阶导数" },
          { "value": "4-5", "label": "向量函数的导数" },
          // 函数的应用
          { "value": "5-1", "label": "微分中值定理" },
          { "value": "5-2", "label": "洛必达法则" },
          { "value": "5-3", "label": "利用导数判定两个函数相等" },
          { "value": "5-4", "label": "函数的增减性与极值" },
          { "value": "5-5", "label": "函数的凹凸性" },
          { "value": "5-6", "label": "泰勒公式" },
          { "value": "5-7", "label": "方程求根的牛顿迭代公式" },
          { "value": "5-8", "label": "函数的作图" },
          // 不定积分
          { "value": "6-1", "label": "原函数与不定积分" },
          { "value": "6-2", "label": "换元积分法和分部积分法" },
          { "value": "6-3", "label": "几类初等函数的积分" },
          // 定积分
          { "value": "7-1", "label": "定积分的概念和基本性质" },
          { "value": "7-2", "label": "定积分的计算" },
          // { "value": "7-3", "label": "连续函数的可积性" },
          // { "value": "7-4", "label": "函数可积的达布准则" },
          // 定积分的应用
          { "value": "8-1", "label": "定积分在分析学中的应用" },
          { "value": "8-2", "label": "定积分在几何学中的应用" },
          { "value": "8-3", "label": "定积分在物理学中的应用" },
          // 广义积分
          { "value": "9-1", "label": "无穷积分" },
          { "value": "9-2", "label": "瑕积分" },
          { "value": "9-3", "label": "一些定积分公式的推广" },
          // 无穷级数
          // { "value": "10-1", "label": "无穷级数的基本概念" },
          // { "value": "10-2", "label": "正项级数" },
          // { "value": "10-3", "label": "任意项级数" },
          // { "value": "10-4", "label": "级数的代数运算" },
          // { "value": "10-5", "label": "零测集和勒贝格定理" },
          // 函数序列和函数级数
          // { "value": "11-1", "label": "函数序列的一致收敛" },
          // { "value": "11-2", "label": "魏尔斯特拉斯逼近定理和阿尔采拉－阿斯科利定理" },
          // { "value": "11-3", "label": "函数序列的积分平均收敛" },
          // { "value": "11-4", "label": "函数级数" },
          // 幂级数
          // { "value": "12-1", "label": "幂级数的收敛区域" },
          // { "value": "12-2", "label": "和函数的性质" },
          // { "value": "12-3", "label": "函数的幂级数展开" },
          // 傅里叶级数
          // { "value": "13-1", "label": "函数的傅里叶级数" },
          // { "value": "13-2", "label": "傅里叶级数收敛的条件" },
          // { "value": "13-3", "label": "傅里叶级数的性质" },
          // { "value": "13-4", "label": "傅里叶级数的积分平均收敛" },
          // { "value": "13-5", "label": "有限区间上的傅里叶展开" },
          // 多元函数的极限和连续性
          { "value": "14-1", "label": "`RR^m` 中的点列和点集" },
          // { "value": "14-2", "label": "多元函数的概念" },
          // { "value": "14-3", "label": "多元函数的极限" },
          // { "value": "14-4", "label": "多元连续函数" }
          // 多元数量函数的微分学
          // { "value": "15-1", "label": "偏导数和全微分" },
          // { "value": "15-2", "label": "方向导数和梯度" },
          // { "value": "15-3", "label": "复合函数的偏导数和隐函数定理" },
          // { "value": "15-4", "label": "高阶偏导数和泰勒公式" },
          // { "value": "15-5", "label": "微分学的几何应用" },
          // 多元向量函数的微分学
          // { "value": "16-1", "label": "线性变换与矩阵分析初步" },
          // { "value": "16-2", "label": "多元向量函数的偏导数与全微分" },
          // { "value": "16-3", "label": "隐函数定理和反函数定理" },
          // 多元函数的极值
          // { "value": "17-1", "label": "简单极值问题" },
          // { "value": "17-2", "label": "条件极值问题" },
          // 含参变量的积分
          // { "value": "18-1", "label": "含参变量的定积分" },
          // { "value": "18-2", "label": "含参变量的广义积分" },
          // { "value": "18-3", "label": "欧拉积分" },
          // 重积分
          // { "value": "19-1", "label": "`RR^m` 中点集的若尔当测度" },
          // { "value": "19-2", "label": "重积分的定义和性质" },
          // { "value": "19-3", "label": "重积分的计算" },
          // { "value": "19-4", "label": "重积分的变元变换" },
          // { "value": "19-5", "label": "曲面的面积" },
          // { "value": "19-6", "label": "重积分的物理应用" },
          // 曲线积分和曲面积分
          // { "value": "20-1", "label": "第一型曲线积分和曲面积分" },
          // { "value": "20-2", "label": "第二型曲线积分和曲面积分" },
          // { "value": "20-3", "label": "三个重要公式" },
          // 广义重积分和含参变量的重积分
          // { "value": "21-1", "label": "广义重积分和含参变量的重积分" },
          // { "value": "21-2", "label": "函数的磨光及其应用" },
          // 场论初步
          // { "value": "22-1", "label": "关于场的基本概念" },
          // { "value": "22-2", "label": "向量场的通量和散度" },
          // { "value": "22-3", "label": "向量场的环量和旋度" },
          // { "value": "22-4", "label": "一些重要定理" },
          // { "value": "22-5", "label": "平面和曲面上的向量场" },
          // 微分形式和斯托克斯公式
          // { "value": "23-1", "label": "反对称多线性函数和外积" },
          // { "value": "23-2", "label": "微分形式和外微分" },
          // { "value": "23-3", "label": "微分形式的变元变换和积分" },
          // { "value": "23-4", "label": "斯托克斯公式" },
          // 综合习题
          { "value": "final-1", "label": "综合习题一" },
          { "value": "final-2", "label": "综合习题二" },
          { "value": "final-3", "label": "综合习题三" },
        ]
      },
      {
        "value": "algebra",
        "label": "抽象代数",
        "children": [
          { "value": "1", "label": "集合论的基本概念" },
          { "value": "2", "label": "抽象代数的基本概念" }
        ]
      },
      {
        "value": "real",
        "label": "实变函数",
        "children": [
          // { "value": "1-1", "label": "集合与点集" },
          { "value": "1-2", "label": "集合的运算" },
          { "value": "1-3", "label": "映射与基数" },
          { "value": "1-4", "label": "`RR^n` 中的度量, 点集的极限点" },
          { "value": "1-5", "label": "闭集, 开集, Borel 集, Cantor 集" }
        ]
      },
      {
        "value": "algorithm",
        "label": "算法导论",
        "children": [
          { "value": "2", "label": "算法基础" },
          { "value": "4", "label": "分治策略" }
        ]
      }
    ]
  },
  {
    "value": "man",
    "label": "手册",
    "color": "dark",
    "children": [
      {
        "value": "app",
        "label": "软件",
        "children": [
          { "value": "excel.md", "label": "Excel", "date": "2025-01-26" },
          { "value": "git.md", "label": "Git", "date": "2025-02-13" },
          { "value": "svn.md", "label": "SVN", "date": "2025-02-14" },
          { "value": "blender.md", "label": "Blender", "date": "2025-02-22" },
          { "value": "magick.md", "label": "Magick", "date": "2025-04-23" },
          { "value": "ffmpeg.md", "label": "FFmpeg", "date": "2025-05-15" },
          { "value": "pdf.md", "label": "PDF 工具集", "date": "2025-05-20" },
          { "value": "ps.md", "label": "Photoshop", "date": "2025-05-27" },
        ],
      },
      {
        "value": "os",
        "label": "系统",
        "children": [
          { "value": "linux.md", "label": "Linux", "date": "2025-01-26" },
          { "value": "windows.md", "label": "Windows", "date": "2025-01-26" },
          { "value": "cmd.md", "label": "cmd", "date": "2025-03-04" },
          { "value": "net.md", "label": "网络", "date": "2025-03-05" },
        ],
      },
      {
        "value": "code",
        "label": "编程",
        "children": [
          { "value": "asm.md", "label": "x86 汇编语言", "date": "2025-03-19" },
          { "value": "c.md", "label": "C 语言", "date": "2025-03-18" },
          { "value": "tex.md", "label": "LaTeX", "date": "2025-05-25" },
        ]
      },
      {
        "value": "py",
        "label": "Python",
        "children": [
          { "value": "env.md", "label": "虚拟环境", "date": "2025-02-13" },
          { "value": "data.md", "label": "数据分析", "date": "2025-02-13" },
          { "value": "torch.md", "label": "Torch", "date": "2025-02-13" },
        ],
      },
      {
        "value": "js",
        "label": "JS",
        "children": [
          { "value": "js.md", "label": "JavaScript", "date": "2025-03-18" },
          { "value": "css.md", "label": "CSS", "date": "2025-03-13" },
          { "value": "lib.md", "label": "工具集", "date": "2025-05-25" },
          { "value": "node.md", "label": "NodeJS", "date": "2025-03-12" },
          { "value": "three.md", "label": "ThreeJS", "date": "2025-02-27" },
          { "value": "cesium.md", "label": "Cesium", "date": "2025-02-24" },
          { "value": "chart.md", "label": "图表", "date": "2025-03-06" },
        ],
      },
      {
        "value": "format",
        "label": "格式",
        "children": [
          { "value": "jpeg.md", "label": "JPEG", "date": "2025-01-26" },
          { "value": "gltf.md", "label": "gltf", "date": "2025-02-24" },
          { "value": "3dtiles.md", "label": "3dtiles", "date": "2025-02-18" },
        ],
      },
    ],
  },
  // 全新的开始?
]
if (typeof module !== 'undefined') {
  module.exports = tocData;
}
