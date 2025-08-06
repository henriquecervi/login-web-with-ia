// Importar as classes necessárias
const fs = require('fs');
const path = require('path');

// Carregar o código do app.js
const appCode = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');

// Executar o código no contexto do teste
eval(appCode);

describe('UIUtils', () => {
  beforeEach(() => {
    // Setup dos mocks
    setupMocks();
  });

  describe('validateEmail', () => {
    test('deve validar emails corretos', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'valid+email@gmail.com',
        'number123@test.org',
        'a@b.co'
      ];

      validEmails.forEach(email => {
        expect(UIUtils.validateEmail(email)).toBe(true);
      });
    });

    test('deve rejeitar emails inválidos', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test.domain.com',
        'test@domain',
        '',
        null,
        undefined,
        'test space@domain.com',
        'test@@domain.com',
        'test@domain@com'
      ];

      invalidEmails.forEach(email => {
        expect(UIUtils.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    test('deve validar senhas fortes', () => {
      const strongPasswords = [
        'Password123',
        'MyStrongPass1',
        'Test123ABC',
        'Complex9Password',
        'Aa1bcdefg'
      ];

      strongPasswords.forEach(password => {
        expect(UIUtils.validatePassword(password)).toBe(true);
      });
    });

    test('deve rejeitar senhas fracas', () => {
      const weakPasswords = [
        'password', // sem maiúscula e número
        'PASSWORD', // sem minúscula e número
        '123456', // sem letras
        'Pass1', // muito curta
        'password123', // sem maiúscula
        'PASSWORD123', // sem minúscula
        'PasswordABC', // sem número
        '', // vazia
        null, // null
        undefined, // undefined
        '12345' // muito curta
      ];

      weakPasswords.forEach(password => {
        expect(UIUtils.validatePassword(password)).toBe(false);
      });
    });
  });

  describe('validateName', () => {
    test('deve validar nomes válidos', () => {
      const validNames = [
        'João',
        'Maria Silva',
        'José da Silva',
        'Ana',
        'Pedro Santos de Oliveira',
        'A B', // mínimo 2 caracteres
        'Nome com vários espaços'
      ];

      validNames.forEach(name => {
        expect(UIUtils.validateName(name)).toBe(true);
      });
    });

    test('deve rejeitar nomes inválidos', () => {
      const invalidNames = [
        { name: 'A', desc: 'muito curto' },
        { name: '', desc: 'vazio' },
        { name: '   ', desc: 'só espaços' },
        { name: null, desc: 'null' },
        { name: undefined, desc: 'undefined' },
        { name: 'a'.repeat(51), desc: 'muito longo (mais de 50 caracteres)' },
        { name: '  A  ', desc: 'com espaços no início/fim mas só 1 caractere real' }
      ];

      invalidNames.forEach(({ name, desc }) => {
        const result = UIUtils.validateName(name);
        // A função validateName retorna valores falsy (false, null, undefined, "")
        // mas nem sempre especificamente false
        expect(result).toBeFalsy();
      });
    });
  });

  describe('formatDate', () => {
    test('deve formatar datas corretamente', () => {
      // Mock do toLocaleDateString para controlar o resultado
      const mockDate = new Date('2024-12-20T14:30:00.000Z');
      const originalToLocaleDateString = Date.prototype.toLocaleDateString;
      
      Date.prototype.toLocaleDateString = jest.fn().mockReturnValue('December 20, 2024 at 02:30 PM');
      
      const formattedDate = UIUtils.formatDate('2024-12-20T14:30:00.000Z');
      
      expect(Date.prototype.toLocaleDateString).toHaveBeenCalledWith('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      expect(formattedDate).toBe('December 20, 2024 at 02:30 PM');
      
      // Restaurar método original
      Date.prototype.toLocaleDateString = originalToLocaleDateString;
    });

    test('deve lidar com diferentes formatos de entrada', () => {
      const testDates = [
        '2024-12-20',
        '2024-12-20T14:30:00',
        '2024-12-20T14:30:00.000Z',
        new Date('2024-12-20'),
        1734703800000 // timestamp
      ];

      testDates.forEach(date => {
        // Verificar se não gera erro
        expect(() => UIUtils.formatDate(date)).not.toThrow();
        
        // Verificar se retorna uma string
        const result = UIUtils.formatDate(date);
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('showMessage', () => {
    let mockElement, mockTextElement;

    beforeEach(() => {
      mockTextElement = {
        textContent: ''
      };
      
      mockElement = {
        querySelector: jest.fn().mockReturnValue(mockTextElement),
        className: '',
        style: { display: 'none' }
      };
      
      document.getElementById = jest.fn().mockReturnValue(mockElement);
    });

    test('deve mostrar mensagem de erro', () => {
      UIUtils.showMessage('errorId', 'Erro de teste', 'error');
      
      expect(document.getElementById).toHaveBeenCalledWith('errorId');
      expect(mockTextElement.textContent).toBe('Erro de teste');
      expect(mockElement.className).toBe('card-panel red lighten-4 red-text text-darken-4');
      expect(mockElement.style.display).toBe('block');
    });

    test('deve mostrar mensagem de sucesso', () => {
      UIUtils.showMessage('successId', 'Sucesso!', 'success');
      
      expect(document.getElementById).toHaveBeenCalledWith('successId');
      expect(mockTextElement.textContent).toBe('Sucesso!');
      expect(mockElement.className).toBe('card-panel green lighten-4 green-text text-darken-4');
      expect(mockElement.style.display).toBe('block');
    });

    test('deve usar o próprio elemento se não houver span', () => {
      mockElement.querySelector.mockReturnValue(null);
      
      UIUtils.showMessage('testId', 'Teste', 'error');
      
      expect(mockElement.textContent).toBe('Teste');
    });

    test('deve tratar elemento não encontrado', () => {
      document.getElementById.mockReturnValue(null);
      
      // Não deve gerar erro
      expect(() => UIUtils.showMessage('inexistente', 'Teste', 'error')).not.toThrow();
    });
  });

  describe('hideMessage', () => {
    let mockElement;

    beforeEach(() => {
      mockElement = {
        style: { display: 'block' }
      };
      
      document.getElementById = jest.fn().mockReturnValue(mockElement);
    });

    test('deve esconder mensagem', () => {
      UIUtils.hideMessage('messageId');
      
      expect(document.getElementById).toHaveBeenCalledWith('messageId');
      expect(mockElement.style.display).toBe('none');
    });

    test('deve tratar elemento não encontrado', () => {
      document.getElementById.mockReturnValue(null);
      
      // Não deve gerar erro
      expect(() => UIUtils.hideMessage('inexistente')).not.toThrow();
    });
  });

  describe('showLoading e hideLoading', () => {
    let mockLoading, mockForm;

    beforeEach(() => {
      mockLoading = { style: { display: 'none' } };
      mockForm = { style: { display: 'block' } };
      
      document.getElementById = jest.fn((id) => {
        if (id === 'loadingId') return mockLoading;
        if (id === 'formId') return mockForm;
        return null;
      });
    });

    test('showLoading deve mostrar loading e esconder form', () => {
      UIUtils.showLoading('loadingId', 'formId');
      
      expect(mockLoading.style.display).toBe('block');
      expect(mockForm.style.display).toBe('none');
    });

    test('hideLoading deve esconder loading e mostrar form', () => {
      UIUtils.hideLoading('loadingId', 'formId');
      
      expect(mockLoading.style.display).toBe('none');
      expect(mockForm.style.display).toBe('block');
    });

    test('deve tratar elementos não encontrados', () => {
      document.getElementById.mockReturnValue(null);
      
      expect(() => UIUtils.showLoading('inexistente', 'inexistente')).not.toThrow();
      expect(() => UIUtils.hideLoading('inexistente', 'inexistente')).not.toThrow();
    });
  });
});