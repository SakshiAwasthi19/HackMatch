/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
// Server-safe mock for framer-motion.
// During SSG, framer-motion's useContext calls crash React 19.
// This mock provides passthrough components that render children without animation.
'use strict';

const React = require('react');

function createMotionProxy() {
  return new Proxy({}, {
    get: function(_target, prop) {
      return React.forwardRef(function MotionComponent(props, ref) {
        const { children, initial: _i, animate: _a, exit: _e, transition: _t, variants: _v, whileHover: _wh, whileTap: _wt, whileInView: _wi, layout: _l, ...rest } = props;
        return React.createElement(String(prop), { ...rest, ref }, children);
      });
    }
  });
}

const motion = createMotionProxy();

function AnimatePresence(props) {
  return props.children || null;
}

module.exports = { motion, AnimatePresence };
module.exports.motion = motion;
module.exports.AnimatePresence = AnimatePresence;
