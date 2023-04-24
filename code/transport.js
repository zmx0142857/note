// 运输问题
var TransportProblem = /** @class */ (function () {
    function TransportProblem(cost, produce, consume) {
        this.cost = cost;
        this.produce = produce;
        this.consume = consume;
    }
    // 寻找初始可行解 (最小值法)
    TransportProblem.prototype.initSolutionByMin = function () {
        var m = this.produce.length;
        var n = this.consume.length;
        var solution = Array.from({ length: m }, function () { return Array.from({ length: n }, function () { return 0; }); });
        var visitedRows = Array.from({ length: m }, function () { return false; });
        var visitedCols = Array.from({ length: m }, function () { return false; });
        var min = Infinity;
        do {
            // row, col = argmin_(i,j) cost[i][j]
            var row = 0, col = 0;
            for (var i = 0; i < m; ++i) {
                if (visitedRows[i])
                    continue;
                for (var j = 0; j < n; ++j) {
                    if (visitedRows[j])
                        continue;
                    if (this.cost[i][j] < min) {
                        min = this.cost[i][j];
                        row = i;
                        col = j;
                    }
                }
            }
            if (min < Infinity) {
                var quantity = Math.min(this.produce[row], this.consume[col]);
                solution[row][col] = quantity;
                this.produce[row] -= quantity;
                this.consume[col] -= quantity;
                if (this.produce[row] === 0)
                    visitedRows[row] = true;
                if (this.consume[col] === 0)
                    visitedCols[col] = true;
            }
        } while (min < Infinity);
        return solution;
    };
    // 寻找初始可行解 (Vogel 法)
    TransportProblem.prototype.initSolutionByVogel = function () {
    };
    return TransportProblem;
}());
function test1() {
    var cost = [
        [4, 12, 4, 11],
        [2, 10, 3, 9],
        [8, 5, 11, 6],
    ];
    var produce = [16, 10, 22];
    var consume = [8, 14, 12, 14];
    var solution = new TransportProblem(cost, produce, consume).initSolutionByMin();
    console.log(solution);
}
test1();
