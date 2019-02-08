angular.module('memoApp', ['ionic'])

// The articles factory handles saving and loading articles of memos
// from local storage, and also lets us save and load the last active
// article index.
.factory('Factory', function() {
	return {
		all: function() {
			return [ {
				title:'高等代数',
				articles: [
					{title:'线性方程组的一般理论', src:'algebra/3.html'},
					{title:'线性空间与线性方程组', src:'algebra/4.html'},
				]
			}, {
				title:'数学分析',
				articles: [
					{title:'初等函数', src:'analysis/1-3.html'},
					{title:'上极限与下极限', src:'analysis/2-5.html'},
				]
			}, {
				title:'解析几何',
				articles: [
					{title:'几何空间的线性结构和度量结构', src:'analytic-geo/1.html'},
					{title:'平面与直线', src:'analytic-geo/2.html'},
				]
			}, {
				title:'微分几何',
				articles: [
					{title:'欧氏空间', src:'diff-geo/1.html'},
					{title:'曲线的局部理论', src:'diff-geo/2.html'},
					{title:'曲面的局部理论', src:'diff-geo/3.html'},
					{title:'标架与曲面论基本定理', src:'diff-geo/4.html'},
					{title:'曲面的内蕴几何学', src:'diff-geo/5.html'},
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
				title:'初等几何',
				articles: [
					{title:'五组公理', src:'geometry/1.html'},
					{title:'抛物线', src:'geometry/5.html'},
				]
			}, {
				title:'初等数论',
				articles: [
					{title:'整除', src:'number-theory/1.html'},
				]
			}, {
				title:'数值分析',
				articles: [
					{title:'非线性方程数值解法', src:'numeric/7.html'},
					{title:'常微分方程数值解法', src:'numeric/8.html'},
				]
			}, {
				title:'常微分方程',
				articles: [
					{title:'绪论', src:'ode/1.html'},
					{title:'一阶微分方程的初等解法', src:'ode/2.html'},
					{title:'解的存在唯一性定理', src:'ode/3.html'},
					{title:'高阶微分方程', src:'ode/4.html'},
					{title:'线性微分方程组', src:'ode/5.html'},
				]
			}, {
				title:'偏微分方程',
				articles: [
					{title:'方程的导出', src:'pde/1.html'},
					{title:'波动方程', src:'pde/2.html'},
					{title:'热传导方程', src:'pde/3.html'},
				]
			}, {
				title:'概率论',
				articles: [
					{title:'附录', src:'probability/0.html'},
					{title:'事件与概率', src:'probability/1.html'},
					{title:'条件概率与独立性', src:'probability/2.html'},
				]
			}, {
				title:'实变函数',
				articles: [
					{title:'集合的运算', src:'real/1-2.html'},
					{title:'映射与基数', src:'real/1-3.html'},
					{title:'`RR^n` 中的度量与极限', src:'real/1-4.html'},
				]
			}];
		},

		getGroupIndex: function() {
			return parseInt(window.localStorage['groupIndex']) || 0;
		},

		setGroupIndex: function(index) {
			window.localStorage['groupIndex'] = index;
		},

		getArticleIndex: function() {
			return parseInt(window.localStorage['articleIndex']) || 0;
		},

		setArticleIndex: function(index) {
			window.localStorage['articleIndex'] = index;
		},
	};
})

.controller('memoCtrl', function($scope, $timeout, $ionicModal,
			Factory, $ionicSideMenuDelegate, $ionicActionSheet) {

	// uncomment to clear caches
	//localStorage.clear();

	// Load or initialize articles
	$scope.groups = Factory.all();

	// Grab the last active, or the first group
	$scope.group = $scope.groups[Factory.getGroupIndex()];

	// Grab the last active, or the first article
	$scope.activeArticle = $scope.group.articles[Factory.getArticleIndex()];

	$scope.doc = document.getElementById('article-container');
	$scope.doc.src = $scope.activeArticle.src;

	$scope.selectGroup = function(index) {
		$scope.group = $scope.groups[index];
		Factory.setGroupIndex(index);
	};

	// Called to select the given article
	$scope.selectArticle = function(group, index) {
		var article = group.articles[index];
		if (article) {
			$scope.activeArticle = article;
			Factory.setArticleIndex(index);
			$scope.doc.src = article.src;
			$ionicSideMenuDelegate.toggleLeft(false);
		} else {
			console.warn('$scope.selectArticle: invalid index.');
		}
	};

	$scope.prevArticle = function() {
		var articleIndex = Factory.getArticleIndex();
		if (articleIndex == 0) {
			var groupIndex = Factory.getGroupIndex();
			if (groupIndex == 0) {
				console.warn('$scope.prevArticle: already first article.');
				return;
			} else {
				--groupIndex;
				$scope.selectGroup(groupIndex);
			}
			articleIndex = $scope.group.articles.length;
		}
		$scope.selectArticle($scope.group, articleIndex - 1);
	};

	$scope.nextArticle = function() {
		var articleIndex = Factory.getArticleIndex();
		if (articleIndex == $scope.group.articles.length - 1) {
			var groupIndex = Factory.getGroupIndex();
			if (groupIndex == $scope.groups.length - 1) {
				console.warn('$scope.nextArticle: no more articles.');
				return;
			} else {
				++groupIndex;
				$scope.selectGroup(groupIndex);
			}
			articleIndex = -1;
		}
		$scope.selectArticle($scope.group, articleIndex + 1);
	};

	$scope.toggleSideMenu = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

	$scope.menu = function(memo) {
		var hideSheet = $ionicActionSheet.show ({
			buttons: [
				{ text: 'Star' },
				{ text: 'Share' },
				{ text: 'Contact us' },
			],
			destructiveText: 'Delete',
			titleText: 'Menu',
			cancelText: 'Cancel',
			cancel: function() {
				// add cancel code...
			},
			buttonClicked: function(index) {
				return true;
			}
		});
		$timeout(function() { hideSheet(); }, 5000);
	};

});
