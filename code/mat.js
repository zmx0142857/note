var Mat = /** @class */ (function () {
    function Mat(mat, title) {
        if (title === void 0) { title = []; }
        this.mat = mat;
        this.title = title;
    }
    Mat.prototype.copy = function () {
        return new Mat(this.mat.map(function (row) { return row.slice(); }), this.title.slice());
    };
    /**
     * 输出矩阵
     * @param digits 保留的小数位数, 传入 undefined 则不作处理
     */
    Mat.prototype.toString = function (digits) {
        var str;
        if (digits !== undefined) {
            digits = Math.pow(10, digits);
            str = function (n) { return String(Math.round(n * digits) / digits); };
        }
        else {
            str = function (n) { return String(n); };
        }
        var width = Math.max.apply(Math, this.mat.flat().map(function (n) { return str(n).length; }));
        var content = this.mat.map(function (row) {
            return row.map(function (item) { return str(item).padStart(width); }).join(' ');
        }).join('\n');
        var title = this.title.length
            ? this.title.map(function (item) { return item.padStart(width); }).join(' ') + '\n'
            : '';
        return title + content;
    };
    /**
     * 返回指定列中绝对值最大元素的行号
     * @param col 列号
     * @param baseRows 已选出主元的行, 应该跳过
     */
    Mat.prototype.colMax = function (col, baseRows) {
        var mat = this.mat;
        var max = 0;
        var row = -1;
        for (var r = 0; r < mat.length; ++r) {
            if (r in baseRows)
                continue;
            var value = Math.abs(mat[r][col]);
            if (value > max) {
                row = r;
                max = value;
            }
        }
        return row;
    };
    /**
     * 求解以 this.mat 为增广矩阵的线性方程组, 将结果
     * k1 T1 + ... + kn Tn + X0 保存到返回的矩阵中
     * 若方程组无解, 返回空矩阵 [[]]
     * @param verbose 显示过程
     */
    Mat.prototype.solve = function (verbose) {
        if (verbose === void 0) { verbose = false; }
        var epsi = 1e-6;
        var m = this.copy();
        var mat = m.mat;
        var rows = mat.length;
        var cols = mat[0].length;
        var base = Object.create(null); // 选为基向量的列
        var baseRows = Object.create(null); // 基向量的 "1" 所在的行
        var nonbase = []; // 非基向量的列
        for (var col = 0; col < cols - 1; ++col) {
            // 选定列主元
            var row = m.colMax(col, baseRows);
            if (row < 0 || Math.abs(mat[row][col]) <= epsi) {
                nonbase.push(col);
                continue;
            }
            var pivot = mat[row][col];
            base[col] = row;
            baseRows[row] = col;
            // 该行同乘一个倍数
            for (var c = 0; c < cols; ++c) {
                mat[row][c] /= pivot;
            }
            // 通过行变换消元, 把该列化为 0; 0; 1; 0
            for (var r = 0; r < rows; ++r) {
                if (r === row)
                    continue;
                for (var c = 0; c < cols; ++c) {
                    if (c === col)
                        continue;
                    mat[r][c] -= mat[row][c] * mat[r][col];
                }
                mat[r][col] = 0;
            }
            if (verbose)
                console.log(m.toString() + '\n');
        }
        // 输出特解 X0
        var title = ['X0'];
        var ret = Array.from({ length: cols - 1 }, function () { return []; });
        ret.forEach(function (row, i) {
            var index = base[i];
            row.push(index !== undefined ? mat[index][cols - 1] : 0);
        });
        // 非基向量取负移到右边
        nonbase.forEach(function (col) {
            title.push('T' + col);
            ret.forEach(function (row, i) {
                var index = base[i];
                row.push(index !== undefined ? -mat[index][col] : i === col ? 1 : 0);
            });
        });
        return new Mat(ret, title);
    };
    return Mat;
}());
// if (typeof module !== 'undefined') {
//     module.export = Mat
// }
function testToString() {
    var m = new Mat([
        [1, 1, 4],
        [5, 1, 114]
    ]);
    console.log(m.toString());
}
function testSolve() {
    console.log(new Mat([
        [1, 1, 0, -3, -1, 0],
        [1, -1, 2, -1, 0, 0],
        [4, -2, 6, 3, -4, 0],
        [2, 4, -2, 4, -7, 0]
    ]).solve().toString());
    /*
   X0                 T2                 T4
    0                 -1 1.1666666666666667
    0                  1 0.8333333333333334
    0                  1                  0
    0                  0 0.3333333333333333
    0                  0                  1
    */
    console.log(new Mat([
        [5, 6, -2, 7, 4, 23],
        [2, 3, -1, 4, 2, 12],
        [7, 9, -3, 5, 6, 23],
        [5, 9, -3, 1, 6, 13]
    ]).solve().toString());
    /*
                    X0                      T2                      T4
    0.9999999999999964 -2.2204460492503136e-16   4.440892098500627e-16
    0.6666666666666685      0.3333333333333334     -0.6666666666666669
                     0                       1                       0
     2.000000000000001   5.551115123125784e-17 -1.1102230246251568e-16
                     0                       0                       1
    */
    console.log(new Mat([
        [1, -1, 1, -1, 1],
        [1, -1, -1, 1, 0],
        [1, -1, -2, 2, -0.5]
    ]).solve().toString());
    /*
     X0  T1  T3
    0.5   1   0
      0   1   0
    0.5   0   1
      0   0   1
    */
}
