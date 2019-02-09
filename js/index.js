angular.module('mathNoteApp', ['ionic'])

// The articles factory handles saving and loading last active
// group/article index.
.factory('Factory', function() {
	return {
		all: function() {
			return tableOfContents;
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

.controller('mathNoteCtrl', function($scope, $timeout, $ionicModal,
			Factory, $ionicSideMenuDelegate, $ionicActionSheet) {

	// uncomment to clear caches
	//localStorage.clear();

	// Load articles
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

	$scope.menu = function(article) {
		var hideSheet = $ionicActionSheet.show ({
			buttons: [
				{ text: '收藏' },
				{ text: '分享' },
				{ text: '联系我们' },
			],
			cancelText: '返回',
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
