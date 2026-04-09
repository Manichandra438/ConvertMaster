/**
 * Central app configuration.
 * Change values here to affect the whole app.
 */
export const config = {
    walkingCharacters: {
        /** Set to false to disable the walking characters feature entirely. */
        enabled: false,
        cat: {
            speed: 0.4,   // px per animation frame
        },
        robot: {
            speed: 0.6,
        },
    },
};
