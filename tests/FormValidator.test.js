// Importar as classes necessárias
const fs = require('fs');
const path = require('path');

// Carregar o código do app.js
const appCode = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');

// Executar o código no contexto do teste
eval(appCode);

describe('FormValidator', () => {
  beforeEach(() => {
    // Setup dos mocks
    setupMocks();
  });

  describe('validateLoginForm', () => {
    test('deve validar formulário de login correto', () => {
      const result = FormValidator.validateLoginForm('test@example.com', 'password123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('deve rejeitar email inválido', () => {
      const result = FormValidator.validateLoginForm('invalid-email', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email');
    });

    test('deve rejeitar email vazio', () => {
      const result = FormValidator.validateLoginForm('', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email');
    });

    test('deve rejeitar email null/undefined', () => {
      let result = FormValidator.validateLoginForm(null, 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email');

      result = FormValidator.validateLoginForm(undefined, 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email');
    });

    test('deve rejeitar senha vazia', () => {
      const result = FormValidator.validateLoginForm('test@example.com', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    test('deve rejeitar senha null/undefined', () => {
      let result = FormValidator.validateLoginForm('test@example.com', null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');

      result = FormValidator.validateLoginForm('test@example.com', undefined);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    test('deve acumular múltiplos erros', () => {
      const result = FormValidator.validateLoginForm('invalid-email', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Invalid email');
      expect(result.errors).toContain('Password is required');
    });

    test('deve aceitar qualquer senha não-vazia para login', () => {
      // Para login, não validamos a complexidade da senha
      const weakPasswords = ['123', 'abc', 'weak'];
      
      weakPasswords.forEach(password => {
        const result = FormValidator.validateLoginForm('test@example.com', password);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateRegisterForm', () => {
    test('deve validar formulário de registro correto', () => {
      const result = FormValidator.validateRegisterForm(
        'João Silva',
        'joao@example.com',
        'Password123',
        'Password123'
      );
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('deve rejeitar nome inválido', () => {
      let result = FormValidator.validateRegisterForm(
        'A', // muito curto
        'joao@example.com',
        'Password123',
        'Password123'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be between 2 and 50 characters');

      // Nome muito longo
      result = FormValidator.validateRegisterForm(
        'A'.repeat(51),
        'joao@example.com',
        'Password123',
        'Password123'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be between 2 and 50 characters');

      // Nome vazio
      result = FormValidator.validateRegisterForm(
        '',
        'joao@example.com',
        'Password123',
        'Password123'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be between 2 and 50 characters');
    });

    test('deve rejeitar email inválido', () => {
      const result = FormValidator.validateRegisterForm(
        'João Silva',
        'invalid-email',
        'Password123',
        'Password123'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email');
    });

    test('deve rejeitar senha fraca', () => {
      const weakPasswords = [
        'password', // sem maiúscula e número
        'PASSWORD', // sem minúscula e número
        '123456', // sem letras
        'Pass1', // muito curta
        'password123', // sem maiúscula
        'PASSWORD123', // sem minúscula
        'PasswordABC' // sem número
      ];

      weakPasswords.forEach(password => {
        const result = FormValidator.validateRegisterForm(
          'João Silva',
          'joao@example.com',
          password,
          password
        );
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must have at least 6 characters, including uppercase, lowercase, and number');
      });
    });

    test('deve rejeitar senhas que não coincidem', () => {
      const result = FormValidator.validateRegisterForm(
        'João Silva',
        'joao@example.com',
        'Password123',
        'DifferentPassword123'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Passwords do not match');
    });

    test('deve acumular múltiplos erros', () => {
      const result = FormValidator.validateRegisterForm(
        'A', // nome inválido
        'invalid-email', // email inválido
        'weak', // senha fraca
        'different' // confirmação diferente
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors).toContain('Name must be between 2 and 50 characters');
      expect(result.errors).toContain('Invalid email');
      expect(result.errors).toContain('Password must have at least 6 characters, including uppercase, lowercase, and number');
      expect(result.errors).toContain('Passwords do not match');
    });

    test('deve validar senhas fortes', () => {
      const strongPasswords = [
        'Password123',
        'MyStrongPass1',
        'Test123ABC',
        'Complex9Password',
        'Aa1bcdefg'
      ];

      strongPasswords.forEach(password => {
        const result = FormValidator.validateRegisterForm(
          'João Silva',
          'joao@example.com',
          password,
          password
        );
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    test('deve tratar valores null/undefined', () => {
      const result = FormValidator.validateRegisterForm(
        null,
        undefined,
        null,
        undefined
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('deve validar nomes com espaços', () => {
      const validNames = [
        'João Silva',
        'Maria da Silva',
        'José Carlos Santos',
        'Ana Beatriz'
      ];

      validNames.forEach(name => {
        const result = FormValidator.validateRegisterForm(
          name,
          'test@example.com',
          'Password123',
          'Password123'
        );
        
        expect(result.isValid).toBe(true);
      });
    });

    test('deve rejeitar nomes só com espaços', () => {
      const result = FormValidator.validateRegisterForm(
        '   ', // só espaços
        'test@example.com',
        'Password123',
        'Password123'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be between 2 and 50 characters');
    });
  });

  describe('integração com UIUtils', () => {
    test('FormValidator deve usar as mesmas regras de validação do UIUtils', () => {
      // Testar se FormValidator e UIUtils são consistentes

      // Email
      const email = 'test@example.com';
      expect(UIUtils.validateEmail(email)).toBe(true);
      
      const loginResult = FormValidator.validateLoginForm(email, 'anypassword');
      expect(loginResult.errors.filter(e => e.includes('email'))).toHaveLength(0);

      // Nome
      const name = 'João Silva';
      expect(UIUtils.validateName(name)).toBe(true);
      
      const registerResult = FormValidator.validateRegisterForm(name, email, 'Password123', 'Password123');
      expect(registerResult.errors.filter(e => e.includes('Name'))).toHaveLength(0);

      // Senha
      const password = 'Password123';
      expect(UIUtils.validatePassword(password)).toBe(true);
      
      const passwordResult = FormValidator.validateRegisterForm(name, email, password, password);
      expect(passwordResult.errors.filter(e => e.includes('Password'))).toHaveLength(0);
    });
  });
});