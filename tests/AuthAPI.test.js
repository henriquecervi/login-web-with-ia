// Importar as classes necessárias
const fs = require('fs');
const path = require('path');

// Carregar o código do app.js
const appCode = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');

// Executar o código no contexto do teste
eval(appCode);

describe('AuthAPI', () => {
  beforeEach(() => {
    // Setup dos mocks
    setupMocks();
    
    // Mock window.location.origin
    window.location.origin = 'http://localhost:3001';
  });

  afterEach(() => {
    // Limpar sessionStorage
    sessionStorage.clear();
  });

  describe('makeRequest', () => {
    test('deve fazer requisição com token de autorização', async () => {
      // Configurar token no sessionStorage
      const tokenData = {
        token: 'test-token-123',
        timestamp: Date.now()
      };
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
      
      // Mock fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true, data: 'test' })
      };
      fetch.mockResolvedValue(mockResponse);

      await AuthAPI.makeRequest('/api/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token-123'
          })
        })
      );
    });

    test('deve fazer requisição sem token quando não autenticado', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true })
      };
      fetch.mockResolvedValue(mockResponse);

      await AuthAPI.makeRequest('/api/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything()
          })
        })
      );
    });

    test('deve retornar resposta de sucesso', async () => {
      const mockData = { message: 'success' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData)
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await AuthAPI.makeRequest('/api/test');

      expect(result).toEqual({
        success: true,
        status: 200,
        data: mockData
      });
    });

    test('deve retornar resposta de erro', async () => {
      const mockData = { error: 'Unauthorized' };
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue(mockData)
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await AuthAPI.makeRequest('/api/test');

      expect(result).toEqual({
        success: false,
        status: 401,
        data: mockData
      });
    });

    test('deve tratar erro de conexão', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await AuthAPI.makeRequest('/api/test');

      expect(result).toEqual({
        success: false,
        status: 500,
        data: { error: 'Server connection error' }
      });
    });

    test('deve mesclar opções customizadas', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({})
      };
      fetch.mockResolvedValue(mockResponse);

      const customOptions = {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: {
          'Custom-Header': 'value'
        }
      };

      await AuthAPI.makeRequest('/api/test', customOptions);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ test: 'data' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Custom-Header': 'value'
          })
        })
      );
    });
  });

  describe('login', () => {
    test('deve fazer requisição de login', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ token: 'login-token' })
      };
      fetch.mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password123' };
      
      const result = await AuthAPI.login(credentials);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result.success).toBe(true);
      expect(result.data.token).toBe('login-token');
    });
  });

  describe('register', () => {
    test('deve fazer requisição de registro', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({ message: 'User created' })
      };
      fetch.mockResolvedValue(mockResponse);

      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'Password123'
      };
      
      const result = await AuthAPI.register(userData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData)
        })
      );

      expect(result.success).toBe(true);
    });
  });

  describe('getProfile', () => {
    test('deve obter perfil com token válido', async () => {
      const tokenData = {
        token: 'valid-token',
        timestamp: Date.now() - (3 * 60 * 1000) // 3 minutos atrás
      };
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ user: { name: 'João', email: 'joao@example.com' } })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await AuthAPI.getProfile();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/profile',
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result.success).toBe(true);
    });

    test('deve retornar erro se não houver token', async () => {
      sessionStorage.getItem.mockReturnValue(null);

      const result = await AuthAPI.getProfile();

      expect(result).toEqual({
        success: false,
        status: 401,
        data: { error: 'Token not found or expired' }
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    test('deve retornar erro se token expirado', async () => {
      const tokenData = {
        token: 'expired-token',
        timestamp: Date.now() - (15 * 60 * 1000) // 15 minutos atrás (expirado)
      };
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));

      const result = await AuthAPI.getProfile();

      expect(result).toEqual({
        success: false,
        status: 401,
        data: { error: 'Token not found or expired' }
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    test('deve fazer requisição de recuperação de senha', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ message: 'Email sent' })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await AuthAPI.forgotPassword({ email: 'test@example.com' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: { email: 'test@example.com' } })
        })
      );

      expect(result.success).toBe(true);
    });
  });

  describe('updatePassword', () => {
    test('deve atualizar senha com token válido', async () => {
      const tokenData = {
        token: 'valid-token',
        timestamp: Date.now() - (3 * 60 * 1000)
      };
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ message: 'Password updated' })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await AuthAPI.updatePassword('oldPass', 'newPass123', 'newPass123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/change-password',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            currentPassword: 'oldPass',
            newPassword: 'newPass123',
            confirmPassword: 'newPass123'
          })
        })
      );

      expect(result.success).toBe(true);
    });
  });
});