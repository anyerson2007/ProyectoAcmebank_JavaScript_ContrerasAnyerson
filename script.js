let usuarios = [];
let currentUser = null;
let cuentas = [];
let movimientos = [];
let tempRecoveryUser = null;

function generarNumeroCuenta() {
    return Math.floor(Math.random() * 9000) + 1000;
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES');
}

function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(monto);
}

function mostrarPantalla(pantallaId) {
    const pantallas = ['loginScreen', 'registrationScreen', 'recoveryScreen', 'newPasswordScreen', 'dashboardScreen', 'consignacionScreen', 'retiroScreen', 'movimientosScreen', 'serviciosScreen', 'extractoScreen', 'certificacionScreen'];
    pantallas.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(pantallaId).classList.remove('hidden');
}

function mostrarMensaje(elementId, mensaje, esError = false) {
    const elemento = document.getElementById(elementId);
    if (!elemento) return;
    elemento.innerHTML = `<div class="alert ${esError ? 'error' : ''}">${mensaje}</div>`;
    setTimeout(() => {
        elemento.innerHTML = '';
    }, 5000);
}

function buscarUsuario(tipoId, numeroId) {
    return usuarios.find(u => u.tipoIdentificacion === tipoId && u.numeroIdentificacion === numeroId);
}

function buscarCuenta(userId) {
    return cuentas.find(c => c.userId === userId);
}

function agregarMovimiento(userId, tipo, monto, descripcion) {
    const movimiento = {
        id: Date.now(),
        userId: userId,
        tipo: tipo,
        monto: monto,
        descripcion: descripcion,
        fecha: new Date().toISOString()
    };
    movimientos.push(movimiento);
    return movimiento;
}

function actualizarSaldo(userId, monto) {
    const cuenta = buscarCuenta(userId);
    if (cuenta) {
        cuenta.saldo += monto;
        return cuenta.saldo;
    }
    return 0;
}

function cargarDashboard() {
    if (!currentUser) return;
    const cuenta = buscarCuenta(currentUser.id);
    if (cuenta) {
        document.getElementById('numeroDecuenta').textContent = cuenta.numeroCuenta;
        document.getElementById('saldoTotal').textContent = formatearMoneda(cuenta.saldo);
        document.getElementById('fechaDecreacion').textContent = formatearFecha(cuenta.fechaCreacion);
    }
}

function cargarMovimientos() {
    if (!currentUser) return;
    const movimientosUsuario = movimientos.filter(m => m.userId === currentUser.id);
    const lista = document.getElementById('movimientosList');
    
    if (movimientosUsuario.length === 0) {
        lista.innerHTML = '<p>No hay movimientos registrados.</p>';
        return;
    }

    lista.innerHTML = movimientosUsuario.map(m => `
        <div class="transaction-item">
            <strong>Tipo:</strong> ${m.tipo}<br>
            <strong>Monto:</strong> ${formatearMoneda(m.monto)}<br>
            <strong>Descripción:</strong> ${m.descripcion || 'Sin descripción'}<br>
            <strong>Fecha:</strong> ${formatearFecha(m.fecha)}
        </div>
    `).join('');
}

function cargarExtracto() {
    if (!currentUser) return;
    const cuenta = buscarCuenta(currentUser.id);
    if (!cuenta) return;
    const movimientosUsuario = movimientos.filter(m => m.userId === currentUser.id);
    const lista = document.getElementById('extractoList');
    document.getElementById('extractoTitular').textContent = `${currentUser.nombres} ${currentUser.apellidos}`;
    document.getElementById('extractoNumeroCuenta').textContent = cuenta.numeroCuenta;
    document.getElementById('extractoSaldo').textContent = formatearMoneda(cuenta.saldo);
    if (movimientosUsuario.length === 0) {
        lista.innerHTML = '<p>No hay movimientos registrados.</p>';
        return;
    }
    lista.innerHTML = movimientosUsuario.map(m => `
        <div class="transaction-item">
            <strong>Tipo:</strong> ${m.tipo}<br>
            <strong>Monto:</strong> ${formatearMoneda(Math.abs(m.monto))}<br>
            <strong>Descripción:</strong> ${m.descripcion || 'Sin descripción'}<br>
            <strong>Fecha:</strong> ${formatearFecha(m.fecha)}
        </div>
    `).join('');
}

function cargarCertificacion() {
    if (!currentUser) return;
    const cuenta = buscarCuenta(currentUser.id);
    if (!cuenta) return;
    document.getElementById('certificacionTitular').textContent = `${currentUser.nombres} ${currentUser.apellidos}`;
    document.getElementById('certificacionTipoId').textContent = currentUser.tipoIdentificacion;
    document.getElementById('certificacionNumeroId').textContent = currentUser.numeroIdentificacion;
    document.getElementById('certificacionNumeroCuenta').textContent = cuenta.numeroCuenta;
    document.getElementById('certificacionSaldo').textContent = formatearMoneda(cuenta.saldo);
    document.getElementById('certificacionFechaCreacion').textContent = formatearFecha(cuenta.fechaCreacion);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const tipoId = document.getElementById('loginTipoId').value;
        const numeroId = document.getElementById('loginNumeroId').value;
        const password = document.getElementById('loginPassword').value;
        const usuario = buscarUsuario(tipoId, numeroId);
        if (usuario && usuario.password === password) {
            currentUser = usuario;
            cargarDashboard();
            mostrarPantalla('dashboardScreen');
        } else {
            mostrarMensaje('loginMessage', 'Credenciales incorrectas', true);
        }
    });

    document.getElementById('createAccountBtn').addEventListener('click', function() {
        mostrarPantalla('registrationScreen');
    });

    document.getElementById('registrationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const tipoId = document.getElementById('regTipoId').value;
        const numeroId = document.getElementById('regNumeroId').value;
        if (buscarUsuario(tipoId, numeroId)) {
            mostrarMensaje('registrationMessage', 'Usuario ya existe', true);
            return;
        }
        const usuario = {
            id: Date.now(),
            tipoIdentificacion: tipoId,
            numeroIdentificacion: numeroId,
            nombres: document.getElementById('regNombres').value,
            apellidos: document.getElementById('regApellidos').value,
            genero: document.getElementById('regGenero').value,
            telefono: document.getElementById('regTelefono').value,
            email: document.getElementById('regEmail').value,
            direccion: document.getElementById('regDireccion').value,
            ciudad: document.getElementById('regCiudad').value,
            password: document.getElementById('regPassword').value
        };
        usuarios.push(usuario);
        const cuenta = {
            id: Date.now(),
            userId: usuario.id,
            numeroCuenta: generarNumeroCuenta(),
            saldo: 0,
            fechaCreacion: new Date().toISOString()
        };
        cuentas.push(cuenta);
        mostrarMensaje('registrationMessage', '¡Usuario registrado exitosamente!');
        setTimeout(() => {
            mostrarPantalla('loginScreen');
        }, 2000);
    });

    document.getElementById('cancelRegBtn').addEventListener('click', function() {
        mostrarPantalla('loginScreen');
    });

    document.getElementById('forgotPasswordLink').addEventListener('click', function() {
        mostrarPantalla('recoveryScreen');
    });

    document.getElementById('recoveryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const tipoId = document.getElementById('recTipoId').value;
        const numeroId = document.getElementById('recNumeroId').value;
        const email = document.getElementById('recEmail').value;
        const usuario = buscarUsuario(tipoId, numeroId);
        if (usuario && usuario.email === email) {
            tempRecoveryUser = usuario;
            mostrarPantalla('newPasswordScreen');
        } else {
            mostrarMensaje('recoveryMessage', 'Datos no encontrados', true);
        }
    });

    document.getElementById('newPasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (newPassword !== confirmPassword) {
            mostrarMensaje('newPasswordMessage', 'Las contraseñas no coinciden', true);
            return;
        }
        if (tempRecoveryUser) {
            tempRecoveryUser.password = newPassword;
            tempRecoveryUser = null;
            mostrarMensaje('newPasswordMessage', 'Contraseña actualizada correctamente');
            setTimeout(() => {
                mostrarPantalla('loginScreen');
            }, 2000);
        }
    });

    document.getElementById('cancelRecBtn').addEventListener('click', () => mostrarPantalla('loginScreen'));
    document.getElementById('cancelNewPassBtn').addEventListener('click', () => mostrarPantalla('loginScreen'));

    document.getElementById('btnConsignar').addEventListener('click', () => mostrarPantalla('consignacionScreen'));
    document.getElementById('btnRetirar').addEventListener('click', () => mostrarPantalla('retiroScreen'));
    document.getElementById('btnMovimiento').addEventListener('click', () => {
        cargarMovimientos();
        mostrarPantalla('movimientosScreen');
    });
    document.getElementById('btnServicios').addEventListener('click', () => mostrarPantalla('serviciosScreen'));
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        currentUser = null;
        mostrarPantalla('loginScreen');
    });

    document.getElementById('consignacionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const monto = parseFloat(document.getElementById('montoConsignacion').value);
        if (isNaN(monto) || monto <= 0) {
            mostrarMensaje('consignacionMessage', 'Monto de consignación inválido', true);
            return;
        }
        const descripcion = document.getElementById('descripcionConsignacion').value || 'Consignación';
        actualizarSaldo(currentUser.id, monto);
        agregarMovimiento(currentUser.id, 'Consignación', monto, descripcion);
        mostrarMensaje('consignacionMessage', `Consignación exitosa: ${formatearMoneda(monto)}`);
        setTimeout(() => {
            cargarDashboard();
            mostrarPantalla('dashboardScreen');
        }, 2000);
    });

    document.getElementById('cancelConsignacionBtn').addEventListener('click', () => mostrarPantalla('dashboardScreen'));

    document.getElementById('retiroForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const monto = parseFloat(document.getElementById('montoRetiro').value);
        if (isNaN(monto) || monto <= 0) {
            mostrarMensaje('retiroMessage', 'Monto de retiro inválido', true);
            return;
        }
        const descripcion = document.getElementById('descripcionRetiro').value || 'Retiro';
        const cuenta = buscarCuenta(currentUser.id);
        if (!cuenta || cuenta.saldo < monto) {
            mostrarMensaje('retiroMessage', 'Saldo insuficiente', true);
            return;
        }
        actualizarSaldo(currentUser.id, -monto);
        agregarMovimiento(currentUser.id, 'Retiro', -monto, descripcion);
        mostrarMensaje('retiroMessage', `Retiro exitoso: ${formatearMoneda(monto)}`);
        setTimeout(() => {
            cargarDashboard();
            mostrarPantalla('dashboardScreen');
        }, 2000);
    });

    document.getElementById('cancelRetiroBtn').addEventListener('click', () => mostrarPantalla('dashboardScreen'));

    document.getElementById('serviciosForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const tipoServicio = document.getElementById('tipoServicio').value;
        const numeroServicio = document.getElementById('numeroServicio').value;
        const monto = parseFloat(document.getElementById('montoServicio').value);
        if (isNaN(monto) || monto <= 0) {
            mostrarMensaje('serviciosMessage', 'Monto a pagar inválido', true);
            return;
        }
        const cuenta = buscarCuenta(currentUser.id);
        if (!cuenta || cuenta.saldo < monto) {
            mostrarMensaje('serviciosMessage', 'Saldo insuficiente', true);
            return;
        }
        actualizarSaldo(currentUser.id, -monto);
        agregarMovimiento(currentUser.id, `Pago ${tipoServicio}`, -monto, `Servicio: ${numeroServicio}`);
        mostrarMensaje('serviciosMessage', `Pago exitoso: ${formatearMoneda(monto)}`);
        setTimeout(() => {
            cargarDashboard();
            mostrarPantalla('dashboardScreen');
        }, 2000);
    });

    document.getElementById('cancelServiciosBtn').addEventListener('click', () => mostrarPantalla('dashboardScreen'));

    document.getElementById('volverMovimientosBtn').addEventListener('click', () => mostrarPantalla('dashboardScreen'));
    
    document.getElementById('btnExtractoBancario').addEventListener('click', () => {
        cargarExtracto();
        mostrarPantalla('extractoScreen');
    });
    document.getElementById('btnCertificacionBancaria').addEventListener('click', () => {
        cargarCertificacion();
        mostrarPantalla('certificacionScreen');
    });

    document.getElementById('volverExtractoBtn').addEventListener('click', () => mostrarPantalla('dashboardScreen'));
    document.getElementById('volverCertificacionBtn').addEventListener('click', () => mostrarPantalla('dashboardScreen'));
    document.getElementById('imprimirCertificacionBtn').addEventListener('click', () => window.print());
});