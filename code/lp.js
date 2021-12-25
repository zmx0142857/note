var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
// lp = 老婆 (❎️), 线性规划 linear programming (✅️)
var LP = /** @class */ (function () {
    /**
     * 初始化标准形线性规划
     * max f = c^T x
     * A x <= b
     * x >= 0
     * @param A m x n 矩阵
     * @param b m 维向量
     * @param c n 维向量
     */
    function LP(A, b, c, vars) {
        if (vars === void 0) { vars = []; }
        var m = b.length;
        var n = c.length;
        this.mat = A; // 将 mat 改造为 (m+1) * (m+n+1) 矩阵
        this.mat.forEach(function (row, i) {
            for (var j = 0; j < m; ++j) {
                row.push(i === j ? 1 : 0); // 为每个约束添加松弛变量
            }
            row.push(b[i]);
        });
        var lastRow = [];
        for (var j = 0; j < n; ++j)
            lastRow.push(-c[j]);
        for (var j = 0; j <= m; ++j)
            lastRow.push(0);
        this.mat.push(lastRow);
        this.base = LP.makeArr(m, function (i) { return n + i + 1; });
        this.originVars = vars;
        this.vars = vars.length
            ? __spreadArray(__spreadArray(['_0'], vars), LP.makeArr(m, function (i) { return "_" + (n + i); })) : LP.makeArr(m + n + 1, function (i) { return "x" + i; });
    }
    LP.makeArr = function (length, callback) {
        return Array.from({ length: length }, function (_, i) { return callback(i); });
    };
    LP.prototype.size = function () {
        var m = this.mat.length - 1;
        var n = this.mat[0].length - m - 1;
        return [m, n];
    };
    /**
     * 输出当前的单纯形表
     * @param digits 保留的小数位数, 传入 0 则不作处理
     */
    LP.prototype.toString = function (digits) {
        var _this = this;
        if (digits === void 0) { digits = 4; }
        var str;
        if (digits) {
            digits = Math.pow(10, digits);
            str = function (x) { return String(Math.round(x * digits) / digits); };
        }
        else {
            str = function (x) { return String(x); };
        }
        var width = Math.max.apply(Math, this.mat.flat().map(function (x) { return str(x).length; }));
        var varWidth = Math.max.apply(Math, this.vars.map(function (s) { return s.length; }));
        var format = function (x) { return str(x).padStart(width); };
        var _a = this.size(), m = _a[0], n = _a[1];
        var lastRow = this.mat[m];
        var head = 'f'.padEnd(varWidth) + ' | '
            + lastRow.slice(0, -1).map(format).join(' ')
            + ' | ' + format(lastRow[m + n]);
        var content = this.mat.slice(0, -1).map(function (row, i) {
            return _this.vars[_this.base[i]].padEnd(varWidth) + ' | '
                + row.slice(0, -1).map(format).join(' ')
                + ' | ' + format(row[m + n]);
        }).join('\n');
        return head + '\n' + content + '\n';
    };
    // 换入变量为 swapin, 换出变量为 base[swapout]
    LP.prototype.rotate = function (swapin, swapout, addone) {
        this.base[swapout] = swapin + addone;
        var pivot = this.mat[swapout][swapin];
        for (var j = 0; j < this.mat[swapout].length; ++j) {
            this.mat[swapout][j] /= pivot;
        }
        for (var i = 0; i < this.mat.length; ++i) {
            if (i !== swapout) {
                var r = -this.mat[i][swapin];
                for (var j = 0; j < this.mat[i].length; ++j) {
                    this.mat[i][j] += this.mat[swapout][j] * r;
                }
            }
        }
    };
    // 求解一个具有初始可行基解的松弛形
    LP.prototype.solve_slack = function (instruction) {
        var addone = instruction === -1 ? 1 : 0;
        // console.log(this.toString())
        // 换入换出指示
        if (instruction > -1) {
            this.rotate(0, instruction, addone);
        }
        var _a = this.size(), m = _a[0], n = _a[1];
        // (n+m choose m)
        var cnt = 1;
        for (var i = 1; i <= m; ++i) {
            cnt *= n + i;
            cnt /= i;
        }
        var status = LP.status.RUNNING;
        while (status === LP.status.RUNNING && cnt--) {
            // 打印计算过程
            // console.log(this.toString())
            // 确定换入变量
            var swapin = this.mat[m].findIndex(function (x) { return x <= -LP.EPS; });
            if (swapin === -1 || swapin === m + n) {
                console.log("solution found");
                status = LP.status.FOUND;
                break;
            }
            // 计算最紧约束, 确定换出变量
            var swapout = -1;
            var min = Infinity;
            for (var i = 0; i < m; ++i) {
                var tmp = this.mat[i][swapin] > LP.EPS
                    ? this.mat[i][n + m] / this.mat[i][swapin] : Infinity;
                if (tmp < min) {
                    min = tmp;
                    swapout = i;
                }
            }
            if (swapout === -1) {
                console.log("unbounded solution");
                status = LP.status.UNBOUNDED;
                break;
            }
            // 旋转
            this.rotate(swapin, swapout, addone);
        }
        // 超过最大迭代次数限制
        if (status === LP.status.RUNNING) {
            console.log("max iterations exceeded");
        }
        return status;
    };
    // 构造辅助线性规划, 引入人工变量 x0, 要求最大化 -x0
    LP.prototype.solve_helper = function (swapout) {
        var _a = this.size(), m = _a[0], n = _a[1];
        // helper 是 (m+1) * (m+n+2) 矩阵, 我们对 mat 进行原地改造
        for (var i = 0; i < m; ++i) {
            this.mat[i].unshift(-1);
        }
        var savedLastRow = this.mat[m];
        this.mat[m] = LP.makeArr(m + n + 2, function (j) { return j === 0 ? 1 : 0; });
        // 换入 x0, 换出 swapout
        console.log("constructing helper LP...");
        // 辅助线性规划是否取得最优解 0
        if (swapout === -1 || this.solve_slack(swapout) !== LP.status.FOUND
            || Math.abs(this.mat[m][m + n + 1]) >= LP.EPS) {
            console.log("the helper LP failed. original problem has no solution");
            return LP.status.NO_SOLUTION;
        }
        // 若 x0 是基变量, 执行一次退化旋转使它成为非基变量
        for (var i = 0; i < m; ++i) {
            if (this.base[i] === 0) {
                for (var j = 0; j <= m + n; ++j) {
                    if (!this.base.includes(j) && Math.abs(this.mat[i][j]) > LP.EPS) {
                        this.rotate(j, i, 0);
                        // console.log(this.toString())
                        break;
                    }
                }
                break;
            }
        }
        // console.log("the helper LP has got optimal value")
        // 去掉 x0, 重置目标函数
        this.mat[m] = savedLastRow;
        for (var i = 0; i < m; ++i) {
            this.mat[i].shift();
            for (var j = 0; j <= m + n; ++j) {
                if (this.mat[i][j] < -1e8) {
                    console.log("lp internal error", i, j, this.mat[i][j]);
                    return LP.status.INTERNAL_ERROR;
                }
            }
            var r = -this.mat[m][this.base[i] - 1];
            if (Math.abs(r) > LP.EPS) {
                for (var j = 0; j <= m + n; ++j) {
                    this.mat[m][j] += this.mat[i][j] * r;
                }
            }
        }
        return this.solve_slack(-1); // 不作换入换出的指示
    };
    // 单纯形法求解线性规划
    LP.prototype.solve = function () {
        console.log('solving...');
        // console.log(this.toString())
        var _a = this.size(), m = _a[0], n = _a[1];
        // 判断初始基解是否可行
        var minb = 0;
        var swapout = -1;
        for (var i = 0; i < m; ++i) {
            if (this.mat[i][m + n] < minb) {
                minb = this.mat[i][m + n];
                swapout = i;
            }
        }
        if (swapout > -1) {
            return this.solve_helper(swapout);
        }
        else {
            return this.solve_slack(-1); // 不作换入换出的指示
        }
    };
    // 调用 solve, 并整理结果
    LP.prototype.solveInfo = function () {
        var _this = this;
        var res = this.solve();
        if (res === LP.status.FOUND) {
            this.sign = this.sign || 1;
            var _a = this.size(), m_1 = _a[0], n_1 = _a[1];
            var varValues_1 = [];
            var posValue_1;
            var getValue_1 = function (index) { return index === -1 ? 0 : _this.mat[index][m_1 + n_1]; };
            this.originVars.forEach(function (v, i) {
                var index = _this.base.indexOf(i + 1);
                if (v.endsWith('+')) { // 无约束变量配对使用
                    posValue_1 = getValue_1(index);
                }
                else if (v.endsWith('-')) {
                    varValues_1.push(v.slice(0, -1) + ': ' + (posValue_1 - getValue_1(index)));
                }
                else
                    varValues_1.push(v + ': ' + getValue_1(index)); // 非负变量直接使用
            });
            return this.toString() + 'solution found\n' +
                'optimal value: ' + (this.sign * this.mat[m_1][m_1 + n_1]) + '\n' +
                varValues_1.join('\n');
        }
        else if (res === LP.status.UNBOUNDED) {
            return this.toString() + 'unbounded solution';
        }
        else if (res === LP.status.RUNNING) {
            return 'failed: max iterations exceeded';
        }
        else if (res === LP.status.INTERNAL_ERROR) {
            return 'failed: internal error';
        }
    };
    /**
     * 从字符串初始化线性规划.
     * 第一行指定目标函数:
     *   max 3x - y - z
     * 接下来 m 行指定约束, 要求线性表达式在左边, 常数在右边 (TODO):
     *   x - 2y + z <= 11
     *   4x - y - 2z <= -3
     *   -2x + z <= 1
     *   2x - z <= -1
     * 默认每个变量都取非负实数, 如果某些变量可以取全体实数, 则将它们在最后一行列出:
     *   free x y z
     */
    LP.from = function (input) {
        var freeVars = [];
        var vars = [];
        var A = [];
        var b = [];
        var c = [];
        var lines = input.trim().split('\n');
        var lastLine = lines[lines.length - 1].trim();
        if (/^free /.test(lastLine)) { // 自由变元
            freeVars.push.apply(// 自由变元
            freeVars, lastLine.slice(5).trim().split(/\s/));
            lines.pop();
        }
        var i = 0;
        var sign = 1;
        lines.forEach(function (line, lineNo) {
            line = line.trim();
            if (/^(min|max) /.test(line)) { // 目标函数
                sign = line.slice(0, 3) === 'min' ? -1 : 1;
                LP.parseExpr(line.slice(4), vars, freeVars, c, sign, lineNo);
            }
            else if (/<=|>=|=/.test(line)) { // 约束
                var match = line.match(/<=|>=|=/);
                var sign_1 = match[0];
                var arr = line.split(sign_1);
                if (sign_1 === '<=' || sign_1 === '=') {
                    var s = 1;
                    b[i] = Number(arr[1].trim()) * s;
                    if (isNaN(b[i]))
                        throw new Error("Line " + (lineNo + 1) + ": '" + arr[1].trim() + "' is not a number: ");
                    A.push([]);
                    LP.parseExpr(arr[0].trim(), vars, freeVars, A[i], s, lineNo);
                    ++i;
                }
                if (sign_1 === '>=' || sign_1 === '=') {
                    var s = -1;
                    b[i] = Number(arr[1].trim()) * s;
                    if (isNaN(b[i]))
                        throw new Error("Line " + (lineNo + 1) + ": '" + arr[1].trim() + "' is not a number: ");
                    A.push([]);
                    LP.parseExpr(arr[0].trim(), vars, freeVars, A[i], s, lineNo);
                    ++i;
                }
            }
            else if (line.trim() !== '') {
                throw new Error("Line " + (lineNo + 1) + ": invalid input '" + line.trim() + "'");
            }
        });
        var fillZero = function (row) {
            for (var j = 0; j < vars.length; ++j) {
                row[j] = row[j] || 0;
            }
        };
        A.forEach(fillZero);
        fillZero(c);
        var lp = new LP(A, b, c, vars);
        lp.sign = sign;
        return lp;
    };
    /**
     * 读入线性表达式, 如 -3x - y - z
     * @param input 表达式
     * @param vars 变量标识符表
     * @param freeVars 自由变量表
     * @param row 系数矩阵的一行
     * @param sign 所有系数同乘一个符号
     * @param lineNo 行号
     */
    LP.parseExpr = function (input, vars, freeVars, row, sign, lineNo) {
        if (sign === void 0) { sign = 1; }
        if (lineNo === void 0) { lineNo = 0; }
        var itemReg = /^\s*(-?\d*(\.\d+)?)?\s*\*?\s*([_a-zA-Z]?[_a-zA-Z0-9]*)/;
        var signReg = /^\s*[+-]/;
        var s = sign;
        while (input.length) {
            // 匹配一项
            var m = input.match(itemReg);
            // console.log(m)
            if (!m)
                throw new Error("Line " + (lineNo + 1) + ": invalid input '" + input + "'");
            input = input.slice(m[0].length).trim();
            // 处理系数与变量标识符
            var coef = !m[1] ? s : m[1] === '-' ? -s : Number(m[1]) * s;
            var sym = m[3];
            LP.addCoef(coef, sym, vars, freeVars, row);
            // 匹配两项间的加减号
            if (!input.length)
                break;
            m = input.match(signReg);
            // console.log(m)
            if (!m)
                throw new Error("Line " + (lineNo + 1) + ": invalid input '" + input + "'");
            input = input.slice(m[0].length).trim();
            // 决定下一项的符号
            s = m[0].trim() === '-' ? -sign : sign;
        }
    };
    LP.addCoef = function (coef, sym, vars, freeVars, row) {
        if (freeVars.includes(sym)) {
            var index = vars.indexOf(sym + '+');
            if (index === -1) { // 新增自由变量
                index = vars.length;
                vars.push(sym + '+');
                vars.push(sym + '-');
            }
            row[index++] = coef;
            row[index] = -coef;
        }
        else {
            var index = vars.indexOf(sym);
            if (index === -1) { // 新增非负变量
                index = vars.length;
                vars.push(sym);
            }
            row[index] = coef;
        }
    };
    LP.EPS = 1e-8;
    LP.status = {
        RUNNING: 0,
        FOUND: 1,
        UNBOUNDED: 2,
        NO_SOLUTION: 3,
        TODO: 4,
        INTERNAL_ERROR: 5
    };
    return LP;
}());
function testSolve() {
    new LP([
        [1, -2, 1],
        [4, -1, -2],
        [-2, 0, 1],
        [2, 0, -1]
    ], [11, -3, 1, -1], [3, -1, -1], ['x', 'y', 'z']).solve();
}
function testExpr() {
    var vars = [], row = [];
    LP.parseExpr(' 3*x-y-z ', vars, [], row);
    // LP.parseExpr('-x1-x2-x4', vars, [], row)
    console.log(vars, row);
}
function testFrom() {
    console.log(LP.from("\n    max 3x-y-z\n    x-2y+z<=11\n    4x-y-2z<=-3\n    -2x+z<=1\n    2x-z<=-1\n    free x y z\n  ").toString());
}
function testSolveInfo() {
    console.log(LP.from("\n    min x3+x4+x5\n    x1-3x2-x3 <= -2\n    -x1+3x2-x3 <= 2\n    x1+x2-x4 <= 0\n    -x1-x2-x4 <= 0\n    x1-x5 <= 0\n    -x1-x5 <= 0\n    free x1 x2 x3 x4 x5\n  ").solveInfo());
}
