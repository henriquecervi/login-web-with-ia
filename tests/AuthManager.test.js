// Importar as classes necessárias
// Como estamos testando código que roda no browser, precisamos carregá-lo de forma especial
const fs = require('fs');
const path = require('path');

// Carregar o código do app.js
const appCode = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');

// Executar o código no contexto do teste
eval(appCode);

describe('AuthManager', () => {
  let originalDateNow;

  beforeEach(() => {
    // Setup dos mocks
    setupMocks();
    
    // Mock Date.now para controlar o tempo nos testes
    originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000000); // Timestamp fixo para testes
  });

  afterEach(() => {
    // Restaurar Date.now original
    Date.now = originalDateNow;
    
    // Limpar storage
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('setToken e getToken', () => {
    test('deve salvar e recuperar token do sessionStorage', () => {
      const testToken = 'test-token-123';
      
      AuthManager.setToken(testToken);
      
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'tokenData',
        JSON.stringify({
          token: testToken,
          timestamp: 1000000
        })
      );
      
      // Mock do retorno do sessionStorage para teste do getToken
      sessionStorage.getItem.mockReturnValue(JSON.stringify({
        token: testToken,
        timestamp: 1000000
      }));
      
      const retrievedToken = AuthManager.getToken();
      expect(retrievedToken).toBe(testToken);
    });

    test('deve remover token antigo do localStorage ao salvar novo token', () => {
      const testToken = 'test-token-123';
      
      AuthManager.setToken(testToken);
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });

    test('deve retornar null se não houver token no sessionStorage', () => {
      sessionStorage.getItem.mockReturnValue(null);
      
      const token = AuthManager.getToken();
      
      expect(token).toBeNull();
    });

    test('deve tratar JSON inválido no sessionStorage', () => {
      sessionStorage.getItem.mockReturnValue('invalid-json');
      
      const token = AuthManager.getToken();
      
      expect(token).toBeNull();
      expect(AuthManager.removeToken).toHaveBeenCalled;
    });
  });

  describe('isTokenValid', () => {
    test('deve retornar true para token válido dentro do prazo', () => {
      const tokenData = {
        token: 'valid-token',
        timestamp: 1000000 - (5 * 60 * 1000) // 5 minutos atrás (dentro do prazo de 10 min)
      };
      
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
      
      const isValid = AuthManager.isTokenValid();
      
      expect(isValid).toBe(true);
    });

    test('deve retornar false para token expirado', () => {
      const tokenData = {
        token: 'expired-token',
        timestamp: 1000000 - (15 * 60 * 1000) // 15 minutos atrás (expirado)
      };
      
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
      
      const isValid = AuthManager.isTokenValid();
      
      expect(isValid).toBe(false);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('tokenData');
    });

    test('deve retornar false se não houver dados de token', () => {
      sessionStorage.getItem.mockReturnValue(null);
      
      const isValid = AuthManager.isTokenValid();
      
      expect(isValid).toBe(false);
    });

    test('deve tratar erro de parsing e limpar token', () => {
      sessionStorage.getItem.mockReturnValue('invalid-json');
      
      const isValid = AuthManager.isTokenValid();
      
      expect(isValid).toBe(false);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('tokenData');
    });
  });

  describe('isAuthenticated', () => {
    test('deve retornar true para usuário autenticado com token válido', () => {
      const tokenData = {
        token: 'valid-token',
        timestamp: 1000000 - (3 * 60 * 1000) // 3 minutos atrás
      };
      
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
      
      const isAuth = AuthManager.isAuthenticated();
      
      expect(isAuth).toBe(true);
    });

    test('deve retornar false para usuário sem token', () => {
      sessionStorage.getItem.mockReturnValue(null);
      
      const isAuth = AuthManager.isAuthenticated();
      
      expect(isAuth).toBe(false);
    });

    test('deve retornar false para usuário com token expirado', () => {
      const tokenData = {
        token: 'expired-token',
        timestamp: 1000000 - (15 * 60 * 1000) // 15 minutos atrás
      };
      
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
      
      const isAuth = AuthManager.isAuthenticated();
      
      expect(isAuth).toBe(false);
    });
  });

  describe('removeToken', () => {
    test('deve remover token do sessionStorage e localStorage', () => {
      AuthManager.removeToken();
      
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('tokenData');
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('logout', () => {
    test('deve limpar todos os dados e redirecionar', () => {
      AuthManager.logout();
      
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('tokenData');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('justLoggedIn');
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('getTokenExpiryInfo', () => {
    test('deve retornar informações corretas de expiração', () => {
      const tokenData = {
        token: 'test-token',
        timestamp: 1000000 - (3 * 60 * 1000) // 3 minutos atrás
      };
      
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
      
      const expiryInfo = AuthManager.getTokenExpiryInfo();
      
      expect(expiryInfo).toEqual({
        expiresAt: new Date(1000000 - (3 * 60 * 1000) + (10 * 60 * 1000)),
        timeLeftMs: 7 * 60 * 1000, // 7 minutos restantes
        timeLeftMinutes: 7.0
      });
    });

    test('deve retornar null se não houver token', () => {
      sessionStorage.getItem.mockReturnValue(null);
      
      const expiryInfo = AuthManager.getTokenExpiryInfo();
      
      expect(expiryInfo).toBeNull();
    });

    test('deve retornar null para JSON inválido', () => {
      sessionStorage.getItem.mockReturnValue('invalid-json');
      
      const expiryInfo = AuthManager.getTokenExpiryInfo();
      
      expect(expiryInfo).toBeNull();
    });
  });

  describe('redirectIfAuthenticated', () => {
    test('deve redirecionar para dashboard se autenticado', () => {
      const tokenData = {
        token: 'valid-token',
        timestamp: 1000000 - (3 * 60 * 1000)
      };
      
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
      
      AuthManager.redirectIfAuthenticated();
      
      expect(window.location.href).toBe('/dashboard');
    });

    test('não deve redirecionar se não autenticado', () => {
      sessionStorage.getItem.mockReturnValue(null);
      window.location.href = '/login';
      
      AuthManager.redirectIfAuthenticated();
      
      expect(window.location.href).toBe('/login');
    });
  });

  describe('redirectIfNotAuthenticated', () => {
    test('deve redirecionar para login se não autenticado', () => {
      sessionStorage.getItem.mockReturnValue(null);
      
      AuthManager.redirectIfNotAuthenticated();
      
      expect(window.location.href).toBe('/login');
    });

    test('não deve redirecionar se autenticado', () => {
      const tokenData = {
        token: 'valid-token',
        timestamp: 1000000 - (3 * 60 * 1000)
      };
      
      sessionStorage.getItem.mockReturnValue(JSON.stringify(tokenData));
      window.location.href = '/dashboard';
      
      AuthManager.redirectIfNotAuthenticated();
      
      expect(window.location.href).toBe('/dashboard');
    });
  });
});