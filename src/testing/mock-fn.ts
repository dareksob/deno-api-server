
/**
 * simple mock function
 */
export function mockFn(implementation: Function = () => {}) {
    const mock = {
        calls: []
    };

    //@ts-ignore
    function fn(...args) {
        //@ts-ignore
        mock.calls.push(args);
        //@ts-ignore
        return implementation.apply(null, args);
    }

    fn.mock = mock;

    return fn;
}