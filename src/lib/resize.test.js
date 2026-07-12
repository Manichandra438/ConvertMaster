import { describe, it, expect } from 'vitest';
import { computeResizedDimensions } from './resize';

describe('computeResizedDimensions', () => {
    describe('mode: exact', () => {
        it('uses given width and height as-is', () => {
            expect(computeResizedDimensions('exact', 1000, 500, { width: 400, height: 300 })).toEqual({ width: 400, height: 300 });
        });

        it('derives height from width to preserve aspect ratio when height is 0', () => {
            expect(computeResizedDimensions('exact', 1000, 500, { width: 400, height: 0 })).toEqual({ width: 400, height: 200 });
        });

        it('falls back to source width when width is 0', () => {
            expect(computeResizedDimensions('exact', 1000, 500, { width: 0, height: 0 })).toEqual({ width: 1000, height: 500 });
        });
    });

    describe('mode: percent', () => {
        it('scales both dimensions by the given percentage', () => {
            expect(computeResizedDimensions('percent', 1000, 500, { percent: 50 })).toEqual({ width: 500, height: 250 });
        });

        it('supports upscaling beyond 100%', () => {
            expect(computeResizedDimensions('percent', 200, 100, { percent: 150 })).toEqual({ width: 300, height: 150 });
        });
    });

    describe('other modes', () => {
        it('returns source dimensions unchanged', () => {
            expect(computeResizedDimensions('maxsize', 640, 480, {})).toEqual({ width: 640, height: 480 });
        });
    });
});
