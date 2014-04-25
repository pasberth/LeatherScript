s = function () {
    try {
        return function () {
            try {
                return function () {
                    try {
                        return function () {
                            try {
                                return function () {
                                    try {
                                        return function () {
                                            throw new NonExhaustivePatterns();
                                        }();
                                    } catch (e) {
                                        if (!(e instanceof NonExhaustivePatterns))
                                            throw e;
                                        return function (x0) {
                                            if (arguments.length != 1)
                                                throw new NonExhaustivePatterns('wrong number of arguments(' + arguments.length + ' for ' + 1 + ')');
                                            if (!(x0 === 1))
                                                throw new NonExhaustivePatterns('Non-exhaustive patterns in lambda');
                                            return 'one';
                                        }(3);
                                    }
                                }();
                            } catch (e) {
                                if (!(e instanceof NonExhaustivePatterns))
                                    throw e;
                                return function (x0) {
                                    if (arguments.length != 1)
                                        throw new NonExhaustivePatterns('wrong number of arguments(' + arguments.length + ' for ' + 1 + ')');
                                    if (!(x0 === 2))
                                        throw new NonExhaustivePatterns('Non-exhaustive patterns in lambda');
                                    return 'two';
                                }(3);
                            }
                        }();
                    } catch (e) {
                        if (!(e instanceof NonExhaustivePatterns))
                            throw e;
                        return function (x0) {
                            if (arguments.length != 1)
                                throw new NonExhaustivePatterns('wrong number of arguments(' + arguments.length + ' for ' + 1 + ')');
                            if (!(x0 === 3))
                                throw new NonExhaustivePatterns('Non-exhaustive patterns in lambda');
                            return 'three';
                        }(3);
                    }
                }();
            } catch (e) {
                if (!(e instanceof NonExhaustivePatterns))
                    throw e;
                return function (x0) {
                    if (arguments.length != 1)
                        throw new NonExhaustivePatterns('wrong number of arguments(' + arguments.length + ' for ' + 1 + ')');
                    if (!(x0 === 4))
                        throw new NonExhaustivePatterns('Non-exhaustive patterns in lambda');
                    return 'four';
                }(3);
            }
        }();
    } catch (e) {
        if (!(e instanceof NonExhaustivePatterns))
            throw e;
        return function (x0) {
            if (arguments.length != 1)
                throw new NonExhaustivePatterns('wrong number of arguments(' + arguments.length + ' for ' + 1 + ')');
            if (!(x0 === 5))
                throw new NonExhaustivePatterns('Non-exhaustive patterns in lambda');
            return 'five';
        }(3);
    }
}(), console.log(s)
