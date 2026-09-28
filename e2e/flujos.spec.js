const { test, expect } = require('@playwright/test');
const { ADMIN_CREDENTIALS, loginAsAdmin } = require('./helpers/auth');

test.describe('E2E Tests — Flujos Principales ICMd_v2', () => {
  test.describe('8.3.1 — Flujo 1: Autenticación', () => {
    test('debe mostrar error con credenciales incorrectas', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.fill('input#email', 'admin@unitec.edu');
      await page.fill('input#password', 'PasswordIncorrecta123');
      await page.click('button.login-submit');

      const alertLocator = page.locator('p.login-error[role="alert"]');
      await expect(alertLocator).toBeVisible();
      await expect(alertLocator).toHaveText(/credenciales|correo|contraseña/i);
    });

    test('debe iniciar sesión con credenciales válidas y permitir cerrar sesión', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.fill('input#email', ADMIN_CREDENTIALS.email);
      await page.fill('input#password', ADMIN_CREDENTIALS.password);
      await page.click('button.login-submit');

      // Redirección automática a dashboard
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('section.monitor-stats')).toBeVisible();

      // Verificar que el token existe en sessionStorage
      const token = await page.evaluate(() =>
        sessionStorage.getItem('icmd-token')
      );
      expect(token).toBeTruthy();

      // Cerrar sesión
      const logoutButton = page.locator('button.header-logout');
      await expect(logoutButton).toBeVisible();
      await logoutButton.click();

      // Verificar que el token fue eliminado y se redirige
      const tokenAfter = await page.evaluate(() =>
        sessionStorage.getItem('icmd-token')
      );
      expect(tokenAfter).toBeNull();
      await expect(page.locator('a.header-login')).toBeVisible();
    });
  });

  test.describe('8.3.2 — Flujo 2: Gestión de Clases', () => {
    test('debe permitir crear, editar y eliminar una clase', async ({
      page,
    }) => {
      await loginAsAdmin(page);

      // 1. Navegar a /clases
      await page.click('nav.main-nav >> text=Clases');
      await expect(page).toHaveURL(/.*clases/);

      // 2. Crear nueva clase
      await page.click('button:has-text("+ Nueva clase")');
      const uniqueCode = `E2E-${Date.now().toString().slice(-4)}`;
      await page.fill('input#class-code', uniqueCode);
      await page.fill('input#class-name', 'Clase Automatizada E2E');
      await page.fill('input#class-section', 'Sec-99');
      await page.fill('input#class-location', 'Laboratorio E2E-101');
      await page.fill('input#class-schedule', 'Sabados 08:00 - 12:00');
      await page.click('div.modal-actions >> button[type="submit"]');

      // 3. Verificar que aparece en el listado
      const newClassCard = page.locator(
        `a.class-card:has-text("${uniqueCode}")`
      );
      await expect(newClassCard).toBeVisible();

      // 4. Entrar al detalle de la clase para editar
      await newClassCard.click();
      await expect(
        page.locator('button:has-text("Editar clase")')
      ).toBeVisible();

      await page.click('button:has-text("Editar clase")');
      await page.fill('input#class-name', 'Clase Automatizada Modificada');
      await page.click('div.modal-actions >> button[type="submit"]');

      // Volver a la lista y verificar nombre actualizado
      await expect(page).toHaveURL(/.*clases/);
      await expect(
        page.locator(`a.class-card:has-text("Clase Automatizada Modificada")`)
      ).toBeVisible();

      // 5. Eliminar la clase creada (no tiene estaciones)
      await page.click(`a.class-card:has-text("${uniqueCode}")`);
      await page.click('button:has-text("Eliminar clase")');
      // Hacer click en el botón de confirmación dentro del modal
      await page.locator('section.confirm-modal button.modal-danger').click();

      // Verificar que ya no está en la lista de activas
      await expect(page).toHaveURL(/.*clases/);
      await expect(
        page.locator(`a.class-card:has-text("${uniqueCode}")`)
      ).toHaveCount(0);
    });
  });

  test.describe('8.3.3 — Flujo 3: Gestión de Estaciones y Semáforo', () => {
    test('debe crear una estación, marcarla como ignorada y verificar contadores', async ({
      page,
    }) => {
      await loginAsAdmin(page);

      // 1. Navegar a /estaciones
      await page.click('nav.main-nav >> text=Estaciones');
      await expect(page).toHaveURL(/.*estaciones/);

      // Obtener la clase actualmente seleccionada en el select
      const classSelect = page.locator(
        'select[aria-label="Filtrar por clase"]'
      );
      await expect(classSelect).toBeVisible();
      const selectedClassId = await classSelect.inputValue();

      // 2. Crear nueva estación
      await page.click('button:has-text("+ Nueva estacion")');
      const stCode = `ST-E2E-${Date.now().toString().slice(-4)}`;
      await page.fill('input#station-code', stCode);
      await page.fill('input#station-name', `Estación ${stCode}`);
      await page.fill('input#station-location', 'Fila E2E - Mesa 1');
      await page.selectOption('select#station-os', 'WINDOWS');
      await page.click('div.modal-actions >> button[type="submit"]');

      // 3. Verificar que aparece en la tabla
      const stationRow = page.locator(
        `table.station-admin-table tbody tr:has-text("${stCode}")`
      );
      await expect(stationRow).toBeVisible();

      // 4. Ir al detalle de la estación
      await page.click(
        `table.station-admin-table tbody tr:has-text("${stCode}") >> a.station-name-link`
      );
      await expect(page).toHaveURL(/.*estaciones\/\d+/);

      // 5. Marcar como ignorada
      const toggleButton = page.locator(
        'button:has-text("Marcar como ignorada")'
      );
      await expect(toggleButton).toBeVisible();
      await toggleButton.click();

      // Regresa a /estaciones y verificar que aparece en la sección de ignoradas
      await expect(page).toHaveURL(/.*estaciones/);
      const ignoredRow = page.locator(
        `table.inactive-classes-table tbody tr:has-text("${stCode}")`
      );
      await expect(ignoredRow).toBeVisible();

      // 6. Ir a /dashboard y seleccionar la misma clase para comprobar contador de ignoradas
      await page.click('nav.main-nav >> text=Dashboard');
      await expect(page).toHaveURL(/.*dashboard/);

      const dashboardClassSelect = page.locator(
        'select[aria-label="Seleccionar clase"]'
      );
      await expect(dashboardClassSelect).toBeVisible();
      await dashboardClassSelect.selectOption(selectedClassId);

      const ignoredCounter = page.locator(
        'section.monitor-stats div.monitor-total:has(span:text-is("Ignoradas")) >> strong'
      );
      await expect(ignoredCounter).toBeVisible();
      const countValue = parseInt(await ignoredCounter.innerText(), 10);
      expect(countValue).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('8.3.4 — Flujo 4: Simulador de Heartbeat', () => {
    test('debe enviar un reporte simulado y reflejarlo en la aplicación', async ({
      page,
    }) => {
      await loginAsAdmin(page);

      // 1. Navegar a /simulador
      await page.click('nav.main-nav >> text=Simulador');
      await expect(page).toHaveURL(/.*simulador/);

      // 2. Esperar a que los selects carguen opciones
      const stationSelect = page.locator('select#simulator-station');
      await expect(stationSelect).toBeEnabled();

      // Seleccionar estado declarado INTERNET
      await page.selectOption('select#simulator-status', 'INTERNET');

      // 3. Enviar reporte
      await page.click('button.simulator-submit');

      // 4. Verificar mensaje de éxito
      const successMessage = page.locator(
        'p.simulator-message.simulator-success'
      );
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toHaveText(
        /declaró INTERNET correctamente/i
      );

      // 5. Verificar que el resultado aparece en el historial
      const historyResult = page.locator('div.simulator-result');
      await expect(historyResult).toBeVisible();
      await expect(historyResult).toContainText('CRITICO');
    });
  });
});
