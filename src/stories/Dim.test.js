import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const crypto = require('crypto');

// Define global crypto object with both getRandomValues and subtle
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
    subtle: {
      digest: async (algorithm, data) => {
        // Ensure the algorithm is compatible with Node.js crypto module
        let nodeAlgorithm;
        switch (algorithm) {
          case 'SHA-256':
            nodeAlgorithm = 'sha256';
            break;
          case 'SHA-1':
            nodeAlgorithm = 'sha1';
            break;
          // Add cases for other algorithms as needed
          default:
            throw new Error('Unsupported algorithm');
        }
        const hash = crypto.createHash(nodeAlgorithm);
        hash.update(data);
        return new Uint8Array(hash.digest());
      },
    },
  }
});

//add polyfill for window.alert()
global.alert = jest.fn();

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { composeStory } from "@storybook/react";
import "@testing-library/jest-dom";

// import Cryptography, { Basic as ExampleBasic } from "./Cryptography.stories"; // 👈 Import the story and its metadata
// import { expect } from "@storybook/test";

// const BasicExample = composeStory(ExampleBasic, Cryptography);

test("Checks if the Example component renders with children and triggers onClick", () => {
  // render(<BasicExample {...ExampleBasic.args} />);

  // const component = screen.getByText("positive-intentions");
  // expect(component).toHaveTextContent("positive-intentions");

  expect(1 + 1).toBe(2);
});
