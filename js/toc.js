var tocData = {

math: {
  title: '数学',
  color: 'yellow',
  favicon: 'pikachu.png',
  toc: [ {
  title:'示例',
  articles: [
    {title:'公式编辑器', src:'example/editor.html', date: '2022-01-12'},
    {title:'Mathml', src:'example/mathml.html'},
    {title:'曲面在线绘制', src:'example/surface.html', date:'2021-12-10'},
  ]
}, {
  title:'未分类',
  articles: [
    {title:'问题', src:'misc/0.html', date:'2021-12-11'},
    {title:'三角函数', src:'misc/2.html', date:'2022-02-11'},
    {title:'不等式', src:'misc/3.html', date:'2022-02-11'},
    {title:'微积分不等式', src:'misc/4.html', date:'2022-01-14'},
    {title:'因式分解', src:'misc/5.html', date:'2021-12-04'},
    {title:'数学家', src:'misc/6.html'},
    {title:'算术与进制', src:'misc/7.html', date:'2022-02-06'},
  ]
}, {
  title:'高等代数',
  articles: [
    {title:'初等代数', src:'algebra/0.html'},
    {title:'矩阵', src:'algebra/1.html', date:'2021-12-13'},
    {title:'行列式', src:'algebra/2.html', date:'2021-12-06'},
    {title:'向量的相关性与线性方程组', src:'algebra/3.html', date:'2021-12-14'},
    {title:'线性空间', src:'algebra/4.html'},
    {title:'线性映射与线性变换', src:'algebra/5.html'},
    {title:'特征值与特征向量', src:'algebra/6.html'},
    {title:'矩阵的相似标准形', src:'algebra/7.html'},
    {title:'线性空间中的度量与内积', src:'algebra/8.html'},
    {title:'实二次型与正定矩阵', src:'algebra/9.html', date:'2021-12-08'},
    {title:'李代数初步', src:'algebra/10.html'},
  ]
}, {
  title:'数学分析',
  articles: [
    {title:'附录', src:'analysis/0.html', date:'2022-02-07'},
    {title:'初等函数', src:'analysis/1.html'},
    {title:'数列的极限', src:'analysis/2.html', date: '2021-12-07'},
    {title:'函数的极限与连续性', src:'analysis/3.html'},
    {title:'导数的应用', src:'analysis/5.html', date: '2022-02-06'},
    {title:'不定积分', src:'analysis/6.html', date: '2021-12-08'},
    {title:'定积分与广义积分', src:'analysis/7.html', date:'2022-01-18'},
    {title:'含参积分与特殊函数', src:'analysis/8.html', date:'2022-01-12'},
    {title:'椭圆函数, 超几何函数', src:'analysis/9.html'},
    {title:'Bernoulli 数与 Riemann zeta 函数', src:'analysis/10.html', date:'2022-01-15'},
    {title:'常数项级数', src:'analysis/11.html'},
    {title:'函数列与函数项级数', src:'analysis/12.html'},
    {title:'Fourier 级数', src:'analysis/13.html'},
    {title:'多元函数的极限与连续性', src:'analysis/14.html'},
    {title:'多元函数微分学', src:'analysis/15.html', date:'2021-11-29'},
    {title:'多元函数的极值', src:'analysis/17.html'},
    {title:'重积分', src:'analysis/19.html'},
    {title:'场论初步', src:'analysis/22.html', date:'2021-12-23'},
    {title:'分数阶微积分', src:'analysis/23.html'},
    {title:'函数方程', src:'analysis/24.html'},
  ]
}, {
  title:'数论',
  articles: [
    {title:'整数, 有理数, 代数数, 连分数', src:'number/0.html'},
    {title:'整除, 最大公约数, 素数', src:'number/1.html'},
    {title:'同余', src:'number/2.html'},
    {title:'阶与原根', src:'number/3.html', date:'2022-01-12'},
    {title:'二次剩余', src:'number/4.html', date:'2022-01-09'},
    {title:'不定方程', src:'number/5.html', date:'2022-02-11'},
    {title:'积性数论函数', src:'number/6.html'},
    {title:'代数数域和代数整数', src:'number/11.html', date:'2022-02-08'},
    {title:'理想的分解', src:'number/12.html', date:'2022-02-02'},
  ]
}, {
  title:'集合论与点集拓扑',
  articles: [
    //      {title:'数理逻辑初步', src:'set/1.html'},
    {title:'集合及其运算', src:'set/2.html'},
    {title:'二元关系与映射', src:'set/3.html'},
    {title:'自然数', src:'set/4.html'},
    {title:'基数', src:'set/6.html'},
  ]
}, {
  title:'复变函数',
  articles: [
    {title:'复数与复变函数', src:'complex/1.html'},
    {title:'全纯函数', src:'complex/2.html'},
    {title:'复变函数的展开', src:'complex/3.html', date:'2022-01-21'},
  ]
}, {
  title:'实变函数',
  articles: [
    {title:'预备知识', src:'real/1.html'},
    {title:'Lebesgue 测度', src:'real/2.html'},
  ]
}, {
  title:'概率论',
  articles: [
    {title:'事件与概率', src:'prob/1.html'},
    {title:'随机变量', src:'prob/2.html'},
    {title:'极限定理', src:'prob/4.html',date:'2021-12-14'},
    {title:'常用分布', src:'prob/5.html'},
  ]
}, {
  title:'数理统计',
  articles: [
    {title:'数理统计的基本概念', src:'stat/1.html', date:'2021-12-13'},
    {title:'参数估计与假设检验', src:'stat/2.html'},
  ]
}, {
  title:'数值分析',
  articles: [
    {title:'插值与样条', src:'numeric/2.html', date:'2022-01-27'},
    {title:'线性方程组', src:'numeric/5.html'},
    {title:'矩阵', src:'numeric/6.html'},
    {title:'非线性方程数值解法', src:'numeric/7.html'},
    {title:'常微分方程数值解法', src:'numeric/8.html'},
    {title:'偏微分方程的 Ritz-Galerkin 方法', src:'numeric/9.html'},
  ]
}, {
  title:'泛函分析',
  articles: [
    {title:'度量空间', src:'functional/1.html'},
    {title:'线性赋范空间', src:'functional/2.html'},
    {title:'有界线性算子', src:'functional/3.html'},
    {title:'Hilbert 空间及其上的有界线性算子', src:'functional/4.html'},
  ]
}, {
  title:'抽象代数',
  articles: [
    {title:'群 (上)', src:'abstract/2.html', date:'2021-12-22'},
    {title:'群 (中)', src:'abstract/3.html'},
    {title:'群 (下)', src:'abstract/4.html', date:'2021-12-22'},
    {title:'半群', src:'abstract/5.html'},
    {title:'环', src:'abstract/6.html'},
    {title:'域', src:'abstract/7.html', date:'2021-12-28'},
    {title:'Galois 理论', src:'abstract/8.html', date:'2022-01-02'},
  ]
}, {
  title:'拓扑学',
  articles: [
    {title:'拓扑空间与连续映射', src:'topology/1.html'},
  ]
}, {
  title:'常微分方程',
  articles: [
    {title:'一阶微分方程的初等解法', src:'ode/2.html'},
    {title:'高阶微分方程', src:'ode/4.html', date:'2022-02-07'},
    {title:'线性微分方程组', src:'ode/5.html'},
  ]
}, {
  title:'偏微分方程',
  articles: [
    {title:'方程的导出', src:'pde/1.html'},
    {title:'波动方程', src:'pde/2.html'},
    {title:'热传导方程', src:'pde/3.html'},
    {title:'位势方程', src:'pde/4.html'},
    {title:'二阶线性偏微分方程的分类', src:'pde/5.html'},
  ]
}, {
  title:'平面几何',
  articles: [
    {title:'五组公理', src:'geometry/1.html'},
    {title:'三角形, 四边形', src:'geometry/3.html', date:'2022-01-28'},
    {title:'圆', src:'geometry/4.html'},
    {title:'抛物线', src:'geometry/5.html'},
  ]
}, {
  title:'解析几何',
  articles: [
    {title:'向量与坐标系', src:'analytic-geo/1.html'},
    {title:'平面与直线', src:'analytic-geo/2.html'},
    {title:'圆锥曲线与二次曲面', src:'analytic-geo/3.html'},
    {title:'平面几何的复数解法', src:'analytic-geo/6.html'},
  ]
}, {
  title:'微分几何',
  articles: [
    {title:'欧氏空间', src:'diff-geo/1.html'},
    {title:'曲线的局部理论', src:'diff-geo/2.html'},
    {title:'曲面的局部理论', src:'diff-geo/3.html', date:'2021-12-10'},
    {title:'标架与曲面论基本定理', src:'diff-geo/4.html'},
    {title:'曲面的内蕴几何学', src:'diff-geo/5.html'},
  ]
}, {
  title:'运筹学',
  articles: [
    {title:'线性规划', src:'or/1.html', date:'2021-12-24'},
  ]
}, {
  title:'组合数学',
  articles: [
    {title:'引言, 计数原理, 鸽巢原理', src:'comb/1.html'},
    {title:'排列与组合', src:'comb/2.html', date:'2022-01-15'},
    {title:'求解递推式', src:'comb/3.html', date:'2021-11-27'},
    {title:'容斥原理', src:'comb/4.html'},
    {title:'离散微积分与特殊计数序列', src:'comb/5.html', date:'2022-01-06'},
    {title:'生成函数', src:'comb/6.html', date:'2022-01-22'},
  ]
}, {
  title:'图论',
  articles: [
    {title:'Paths and cycles', src:'graph/2.html'},
  ]
}, {
  title:'数学游戏',
  articles: [
    {title:'数学游戏', src:'recreation/1.html'},
  ]
}]},

cs: {
  title: '计算机',
  color: 'green',
  favicon: 'dango.png',
  toc: [ {
  title:'数据结构',
  articles: [
    {title:'数据结构习题', src:'ds/exercise.html', date:'2021-11-22'},
    {title:'其它算法', src:'ds/0.html'},
    {title:'绪论', src:'ds/1.html'},
    {title:'线性表', src:'ds/2.html'},
    {title:'栈与队列', src:'ds/3.html'},
    {title:'递归与回溯', src:'ds/4.html'},
    {title:'字符串', src:'ds/5.html'},
    {title:'树与二叉树', src:'ds/6.html'},
    {title:'矩阵与广义表', src:'ds/7.html'},
    {title:'图', src:'ds/8.html'},
    {title:'查找', src:'ds/9.html', date: '2021-11-24'},
    {title:'随机算法', src:'ds/10.html', date:'2022-02-09'},
    {title:'排序', src:'ds/11.html', date: '2021-12-03'},
    {title:'文件', src:'ds/12.html'},
    {title:'数论算法', src:'ds/13.html', date: '2022-01-07'},
    {title:'动态规划与贪心算法', src:'ds/14.html'},
    {title:'计算几何', src:'ds/15.html', date: '2021-12-04'},
    {title:'算法题模板', src:'ds/16.html', date: '2021-12-02'},
  ]
}, {
  title:'机器学习',
  articles: [
    {title:'Logistic 回归', src:'ml/1.html'},
  ]
}, {
  title:'操作系统',
  articles: [
    {title:'引论', src:'os/1.html'},
    {title:'进程', src:'os/2.html'},
    {title:'内存', src:'os/3.html'},
  ]
},{
  title:'计算机组成原理',
  articles: [
    {title:'计算机系统概论', src:'com/1.html'},
  ]
},{
  title:'数据库系统概论',
  articles: [
    {title:'绪论', src:'db/1.html'},
    {title:'关系数据库', src:'db/2.html'},
    {title:'SQL', src:'db/3.html'},
    {title:'数据库习题', src:'db/exercise.html'},
  ]
},{
  title:'计算机网络',
  articles: [
    {title:'概述', src:'net/1.html'},
    {title:'物理层', src:'net/2.html'},
  ]
}, {
  title:'工具',
  articles: [
    {title:'svg 流程图', src:'utils/svg-flowchart.html'},
    {title:'无奖竞猜', src:'utils/exam.html'},
  ]
}]},

physics: {
  title: '物理',
  color: 'purple',
  toc: [ {
  title:'未分类',
  articles: [
    {title:'单位与数量', src:'misc/1.html'},
    {title:'物理学家', src:'misc/6.html'},
  ]
}, {
  title:'力学',
  articles: [
    {title:'质点运动学', src:'mechanics/1.html'},
  ]
}, {
  title:'流体力学',
  articles: [
    {title:'流体力学基础', src:'hydromechanics/1.html', date:'2021-11-24'},
  ]
}, {
  title:'光学',
  articles: [
    {title:'光学', src:'optics/1.html'},
  ]
}]},

lang: {
  title: '语言',
  color: 'dark',
  toc: [ {
    title: '汉语',
    articles: [
      {title:'易读错字词整理', src:'zh/words.html'},
    ]
  }, {
    title: '日语',
    articles: [
      {title:'学五十音', src:'jp/kana.html'},
      {title:'日语动词', src:'jp/words.html'},
    ]
  }, {
    title: '歌词',
    articles: [
      {title:'L\'arc~en~Ciel', src:'lyric/larc~en~ciel.html'},
    ]
}]},

music: {
  title: '音乐',
  color: 'pink',
  toc: [ {
    title: '工具',
    articles: [
      {title:'播放器', src:'utils/player.html'},
      {title:'简谱', src:'utils/jianpu.html'},
      {title:'乐谱编辑器', src:'utils/lywriter.html'},
      {title:'练耳', src:'utils/ear-training.html'},
      {title:'键盘', src:'utils/piano.html'},
      {title:'乐谱', src:'utils/svg-score.html'},
    ]
  }]
}
// 全新的开始?
};
if (typeof module !== 'undefined') {
  module.exports = tocData;
}
