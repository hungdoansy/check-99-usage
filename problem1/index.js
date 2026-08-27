var sum_to_n_a = function(n) {
    // math calculation
    return n * (n + 1) / 2;
};

var sum_to_n_b = function(n) {
    // simple for loop
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_c = function(n) {
    // recursive
    if (n === 1) {
        return 1
    }
    return n + sum_to_n_c(n - 1);
};