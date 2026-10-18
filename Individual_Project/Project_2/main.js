/* ---------- Parser ---------- */

function tokenize(keys) {
   const tokens = [];
   let digits = "";

   for (const key of keys) {
      if (typeof key === "string" && /^[0-9.]$/.test(key)) {
         digits += key;
         continue;
      }
      if (digits !== "") {
         tokens.push(toNumber(digits));
         digits = "";
      }
      tokens.push(key);
   }
   if (digits !== "") {
      tokens.push(toNumber(digits));
   }

   return tokens;
}

function toNumber(text) {
   const value = Number(text);
   if (Number.isNaN(value)) {
      throw new Error(`Bad number: ${text}`);
   }
   return value;
}

function nthRoot(x, y) {
   if (y === 0) {
      throw new Error("0th root");
   }
   if (x < 0) {
      if (Number.isInteger(y) && y % 2 !== 0) {
         return -((-x) ** (1 / y));
      }
      throw new Error("Even root of a negative number");
   }
   return x ** (1 / y);
}

function calculate(keys) {
   const tokens = tokenize(keys);
   let pos = 0;
   const peek = () => tokens[pos];
   const next = () => tokens[pos++];

   function parseSum() {
      let value = parseProduct();
      while (peek() === "+" || peek() === "-") {
         const op = next();
         const right = parseProduct();
         value = op === "+" ? value + right : value - right;
      }
      return value;
   }

   function parseProduct() {
      let value = parseUnary();
      while (peek() === "*" || peek() === "/") {
         const op = next();
         const right = parseUnary();
         if (op === "/" && right === 0) {
            throw new Error("Division by zero");
         }
         value = op === "*" ? value * right : value / right;
      }
      return value;
   }

   function parseUnary() {
      if (peek() === "-") {
         next();
         return -parseUnary();
      }
      return parsePower();
   }

   function parsePower() {
      let left = parsePrimary();
      while (peek() === "square") {
         next();
         left = left ** 2;
      }
      if (peek() === "pow") {
         next();
         return left ** parseUnary();
      }
      if (peek() === "root") {
         next();
         return nthRoot(parseUnary(), left);
      }
      return left;
   }

   function parsePrimary() {
      const token = next();

      if (typeof token === "number") {
         return token;
      }
      if (token === "(") {
         const value = parseSum();
         closeParen();
         return value;
      }
      if (token === "sin") {
         const value = parseSum();
         closeParen();
         return Number(Math.sin((value * Math.PI) / 180).toFixed(9)); // degrees
      }
      if (token === "sqrt") {
         const value = parseSum();
         closeParen();
         return nthRoot(value, 2);
      }
      if (token === undefined) {
         throw new Error("Unexpected end");
      }
      throw new Error(`Unexpected ${token}`);
   }

   function closeParen() {
      if (peek() === ")") {
         next();
      } else if (peek() !== undefined) {
         throw new Error(`Expected ) but found ${peek()}`);
      }
   }

   const result = parseSum();
   if (pos < tokens.length) {
      throw new Error(`Unexpected ${peek()}`);
   }
   if (!Number.isFinite(result)) {
      throw new Error("Result is not a number");
   }
   return result;
}

/* ---------- Display ---------- */

const MAX_CHARS = 9;

const LABELS = {
   "*": "×",
   "/": "÷",
   "-": "−",
   ".": ",",
   sin: "sin(",
   sqrt: "√(",
   pow: "^",
   root: "√",
   square: "²",
};

function label(key) {
   if (typeof key === "number") {
      return formatNumber(key);
   }
   return LABELS[key] ?? key;
}

function formatNumber(value) {
   for (let digits = 12; digits >= 1; digits--) {
      const rounded = Number(value.toPrecision(digits));
      let text = String(rounded);
      if (text.length > MAX_CHARS) {
         text = rounded.toExponential();
      }
      if (text.length <= MAX_CHARS) {
         return text.replace(".", ",");
      }
   }
   return "Error";
}

/* ---------- Calculator ---------- */

const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const guyEl = document.querySelector(".guy");

const OPERATORS = ["+", "-", "*", "/", "pow", "root", "square"];

const state = {
   keys: [],
   result: "0",
   justCalculated: false,
};

function press(key) {
   const continuing = state.justCalculated;
   state.justCalculated = false;

   if (key === "clear") {
      state.keys = [];
      state.result = "0";
   } else if (key === "backspace") {
      state.keys.pop();
   } else if (key === "=") {
      showResult();
   } else if (continuing) {
      const answer = Number(state.result.replace(",", "."));
      state.keys = OPERATORS.includes(key) ? [answer, key] : [key];
   } else {
      state.keys.push(key);
   }

   render();
}

function showResult() {
   if (state.keys.length === 0) {
      return;
   }
   try {
      state.result = formatNumber(calculate(state.keys));
      state.justCalculated = true;
   } catch (error) {
      console.log(error.message);
      state.result = "Error";
      guyEl.classList.add("freakout");
   }
}

guyEl.addEventListener("animationend", (event) => {
   if (event.animationName === "freakout") {
      guyEl.classList.remove("freakout");
   }
});

function render() {
   expressionEl.textContent = state.keys.map(label).join("");
   resultEl.textContent = state.result;
}

document.querySelector(".keys").addEventListener("click", (event) => {
   const button = event.target.closest(".button");
   if (button) {
      press(button.dataset.key);
   }
});

/* ---------- Keyboard ---------- */

const KEYBOARD = {
   Enter: "=",
   Backspace: "backspace",
   Delete: "clear",
   Escape: "clear",
   ",": ".",
   "^": "pow",
   s: "sin",
   r: "root",
};

document.addEventListener("keydown", (event) => {
   if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
   }

   const key = KEYBOARD[event.key] ?? event.key;
   const button = document.querySelector(
      `.button[data-key="${CSS.escape(key)}"]`,
   );
   if (!button) {
      return;
   }

   event.preventDefault();
   button.classList.add("pressed");
   press(key);
});

document.addEventListener("keyup", () => {
   for (const button of document.querySelectorAll(".pressed")) {
      button.classList.remove("pressed");
   }
});

render();
