import { validateUsername, validatePassword } from '../utils/validation.js';




describe('validateUsername', () => {
    // Positive tests
    test('should return true for a valid username not in the banned list', () => {
        expect(validateUsername('john_doe')).toBe(true);
    });

    // Banned words tests
    test('should return false for a username that is a banned word', () => {
        expect(validateUsername('admin')).toBe(false);
    });
    test('should return false for a username that is a banned word (case insensitive)', () => {
        expect(validateUsername('Admin')).toBe(false);
        expect(validateUsername('RoOt')).toBe(false);
    });

    // Length requirement tests
    test('should return false for a username that is too short', () => {
        expect(validateUsername('ab')).toBe(false);
    });
    test('should return true for a username that meets the length requirement', () => {
        expect(validateUsername('abc')).toBe(true);
    });
});

describe('validatePassword', () => {
    // Positive tests
    test('should return true for a valid password', () => {
        expect(validatePassword('pass1234')).toBe(true);
    });

    // Length requirement tests
    test('should return false for a password that is too short', () => {
        expect(validatePassword('abc')).toBe(false);
    });
    test('should return true for a password that meets the length requirement', () => {
        expect(validatePassword('abcd')).toBe(true);
    });

});





