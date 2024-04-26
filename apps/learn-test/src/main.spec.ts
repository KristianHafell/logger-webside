import { add, graiterThan} from './main';

describe('add', () => {
    it('should add two numbers', () => {
        expect(add(1, 2)).toEqual(3);
    });
});

describe('graiterThan', () => {
    it('should return true if a is greater than b', () => {
        expect(graiterThan(2, 1)).toEqual(true);
    });

    it('should return false if a is less than b', () => {
        expect(graiterThan(1, 2)).toEqual(false);
    });
})
