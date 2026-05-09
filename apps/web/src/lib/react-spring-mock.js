/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// Server-safe mock for @react-spring/web.
// Prevents useContext crashes during SSG.
'use strict';

const React = require('react');

function useSpring() {
  return [{}, function() {}];
}

function useSprings(_count, _config) {
  return [[], function() {}];
}

function useTrail(_count, _config) {
  return [];
}

function useTransition(_items, _config) {
  return function() { return []; };
}

function useChain() {}

function useSpringRef() {
  return { start: function() {}, stop: function() {} };
}

const animated = new Proxy({}, {
  get: function(_target, prop) {
    return React.forwardRef(function AnimatedComponent(props, ref) {
      const { children, style, ...rest } = props;
      return React.createElement(String(prop), { ...rest, ref, style: style || {} }, children);
    });
  }
});

const a = animated;

const config = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
  molasses: { tension: 280, friction: 120 },
};

module.exports = { useSpring, useSprings, useTrail, useTransition, useChain, useSpringRef, animated, a, config };
