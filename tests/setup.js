// Setup global para testes
// Importar as classes do app.js para torná-las disponíveis nos testes

// Simular o objeto window e document que são necessários para o app.js
global.window = global.window || {};
global.document = global.document || {};

// Mock básico do DOM
global.document.addEventListener = jest.fn();
global.document.getElementById = jest.fn();
global.document.querySelector = jest.fn();
global.document.querySelectorAll = jest.fn(() => []);

// Mock do MaterializeCSS (M)
global.M = {
  AutoInit: jest.fn(),
  Tooltip: { init: jest.fn() },
  Modal: { init: jest.fn() },
  Dropdown: { init: jest.fn() },
  Sidenav: { init: jest.fn() },
  Tabs: { init: jest.fn() },
  Collapsible: { init: jest.fn() },
  FormSelect: { init: jest.fn() },
  Datepicker: { init: jest.fn() },
  Timepicker: { init: jest.fn() },
  CharacterCounter: { init: jest.fn() },
  Chips: { init: jest.fn() },
  FloatingActionButton: { init: jest.fn() },
  ScrollSpy: { init: jest.fn() },
  Pushpin: { init: jest.fn() },
  Parallax: { init: jest.fn() },
  Carousel: { init: jest.fn() },
  Materialbox: { init: jest.fn() },
  Slider: { init: jest.fn() },
  Autocomplete: { init: jest.fn() },
  toast: jest.fn()
};

// Configurar timeout de teste mais longo para operações assíncronas
jest.setTimeout(10000);