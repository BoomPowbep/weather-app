var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

class Utils {

    /**
     * Removes useless '0' in front of a number (string format)
     * Ex : '03' => '3'
     * @param numberString
     * @returns {string}
     */
    static removeUselessZero(numberString) {
        return (numberString[0] === '0') ? numberString.substring(1) : numberString;
    }

    /**
     * Registers an event listener for a list of elements
     * @param elements
     * @param action
     * @param callback
     */
    static registerAll(elements, action, callback) {
        let iterator = null;
        for(iterator of elements) {
            iterator.addEventListener(action, callback);
        }
    }

    /**
     * Hides multiple elements
     * @param elements
     */
    static hideAll(elements) {
        let iterator = null;
        for(iterator of elements) {
            iterator.style.display = 'none';
        }
    }

    /**
     * Shows multiple elements
     * @param elements
     * @param type
     */
    static showAll(elements, type = 'block') {
        let iterator = null;
        for(iterator of elements) {
            iterator.style.display = type;
        }
    }

    /**
     * Removes all children from a parent
     * @param parentId
     */
    static removeAllChildren(parentId) {
        let parent = document.querySelector(parentId);
        // removes all children
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    /**
     * TODO: fix the bug: doesn't stops
     * Fades in the element passed as argument
     * @param element
     * @param display
     */
    static fadeIn(element, display) {
        let op = 0.1;  // Initial opacity
        element.style.opacity = op;
        element.style.display = display;

        var loopID = null;

        function loop() {

            op += 0.01;
            element.style.opacity = op;
            loopID = requestAnimationFrame(loop);
            if(op >= 1.0) {
                cancelAnimationFrame(loopID);
            }
        }
        loopID = requestAnimationFrame(loop);
    }

    /**
     * TODO: fix the bug: doesn't stops
     * Fades out the element passed as argument
     * @param element
     */
    static fadeOut(element) {
        let op = 1;  // Initial opacity
        element.style.opacity = op;

        var loopID = null;

        function loop(op) {

            console.log(loopID, op);
            if(op <= 0.0) {
                console.log('ok');
                cancelAnimationFrame(loopID);
            }
            op -= 0.01;
            element.style.opacity = op;
            loopID = requestAnimationFrame(loop.bind(this, op));
        }
        loopID = requestAnimationFrame(loop.bind(this, op));
    }
}

export default Utils;
