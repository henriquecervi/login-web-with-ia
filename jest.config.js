module.exports = {
  // Ambiente de teste para simular o DOM do navegador
  testEnvironment: 'jsdom',
  
  // Padrão de arquivos de teste
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Configuração de cobertura
  collectCoverageFrom: [
    'public/js/**/*.js',
    '!public/js/**/materialize*.js',
    '!**/node_modules/**'
  ],
  
  // Diretório de saída da cobertura
  coverageDirectory: 'coverage',
  
  // Relatórios de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Setup files para configurar o ambiente de teste
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Mock para o localStorage e sessionStorage
  setupFiles: ['<rootDir>/tests/jest.setup.js'],
  
  // Transformações
  transform: {},
  
  // Extensões de arquivo
  moduleFileExtensions: ['js', 'json'],
  
  // Verbose output
  verbose: true,
  
  // Limpar mocks automaticamente
  clearMocks: true
};