# 🏇 Vaqueros Reynosa — Backend

## 📋 Descripción

Este repositorio contiene el **Backend de la plataforma web de Vaqueros Reynosa**.

El Backend será responsable de proporcionar los servicios necesarios para que el Frontend pueda consultar y administrar la información del sistema.

Entre sus principales responsabilidades estarán la autenticación de usuarios, administración de jugadores, juegos, boletos, bonos y la validación de boletos mediante código QR.

## 🔗 Repositorios del proyecto

### Backend

https://github.com/KTreviD/Vaqueros-Backend

### Frontend

https://github.com/KTreviD/Vaqueros-Frontend

---

## 🎯 Objetivo

Desarrollar una API que permita administrar la información de Vaqueros Reynosa y conectar el Frontend con los servicios y datos de la plataforma.

El Backend será responsable de procesar las solicitudes realizadas desde la aplicación web y aplicar las reglas de negocio correspondientes.

---

## 👥 Tipos de usuario

### 👤 Usuario / Fan

El sistema permitirá que los usuarios:

* Se registren.
* Inicien sesión.
* Consulten jugadores.
* Consulten juegos.
* Consulten bonos.
* Compren boletos.
* Compren bonos.
* Consulten sus compras.
* Consulten sus boletos.

### 🔐 Administrador

El administrador tendrá permisos para:

* Crear jugadores.
* Modificar jugadores.
* Eliminar jugadores.
* Administrar posiciones.
* Crear juegos.
* Modificar juegos.
* Registrar resultados.
* Crear bonos.
* Modificar bonos.
* Consultar usuarios.
* Consultar boletos.
* Consultar compras.
* Validar boletos.

---

## 🏗️ Arquitectura

El Backend funcionará como intermediario entre el Frontend y la base de datos.

```text
┌───────────────────────┐
│       FRONTEND        │
│    Vaqueros Reynosa   │
└──────────┬────────────┘
           │
           │ HTTP / API
           ▼
┌───────────────────────┐
│       BACKEND         │
│    Vaqueros Reynosa   │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│      BASE DE DATOS    │
└───────────────────────┘
```

---

## 📁 Estructura actual del proyecto

```text
Vaqueros-Backend/
│
├── public/
│
├── src/
│
├── tests/
│
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Tecnologías

El proyecto utiliza una estructura basada en:

* TypeScript
* Node.js / npm
* ESLint
* Prettier

Las dependencias y versiones específicas se encuentran definidas en `package.json`.

---

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/KTreviD/Vaqueros-Backend.git
```

### 2. Entrar al proyecto

```bash
cd Vaqueros-Backend
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

Los comandos disponibles pueden consultarse directamente en `package.json`.

---

## 🔌 API

El Backend proporcionará servicios que serán consumidos por el Frontend.

### Usuarios

```text
POST   /api/auth/register
POST   /api/auth/login
```

### Jugadores

```text
GET     /api/jugadores
GET     /api/jugadores/:id
POST    /api/jugadores
PUT     /api/jugadores/:id
DELETE  /api/jugadores/:id
```

### Juegos

```text
GET     /api/juegos
GET     /api/juegos/:id
POST    /api/juegos
PUT     /api/juegos/:id
DELETE  /api/juegos/:id
```

### Bonos

```text
GET     /api/bonos
GET     /api/bonos/:id
POST    /api/bonos
PUT     /api/bonos/:id
DELETE  /api/bonos/:id
```

### Boletos

```text
POST    /api/boletos
GET     /api/boletos
GET     /api/boletos/:id
POST    /api/boletos/:id/validar
```

> Los endpoints anteriores representan la propuesta inicial de la API y podrán cambiar conforme avance el desarrollo.

---

## 🗄️ Modelo de datos

Las principales entidades consideradas para el sistema son:

### Usuario

```text
id
nombre
correo
password
telefono
rol
fecha_registro
```

### Jugador

```text
id
nombre
numero
posicion
fotografia
descripcion
activo
```

### Juego

```text
id
rival
fecha
hora
estadio
precio_boleto
estado
resultado
```

### Boleto

```text
id
usuario_id
juego_id
codigo_qr
precio
estado_pago
utilizado
fecha_compra
```

### Bono

```text
id
nombre
precio
descripcion
imagen
activo
```

### Compra de bono

```text
id
usuario_id
bono_id
precio
estado_pago
fecha_compra
```

---

## 🎟️ Validación de boletos

Cada boleto tendrá un identificador único y un código QR.

El proceso será:

```text
Usuario compra boleto
        │
        ▼
Sistema genera boleto
        │
        ▼
Se genera código QR
        │
        ▼
Usuario presenta QR
        │
        ▼
Sistema valida boleto
        │
    ┌───┴────┐
    ▼        ▼
  Válido   Inválido
    │        │
    ▼        ▼
 Permitir   Rechazar
 acceso      acceso
```

El sistema deberá comprobar que:

* El boleto exista.
* El boleto corresponda al juego.
* El pago haya sido registrado.
* El boleto no haya sido utilizado anteriormente.

---

## 🔐 Seguridad

El Backend deberá proteger la información de los usuarios y las funciones administrativas.

Se considerará:

* Autenticación.
* Autorización por roles.
* Validación de información.
* Protección de rutas administrativas.
* Manejo seguro de contraseñas.
* Variables de entorno.
* Validación de boletos.
* Control de acceso.

Las contraseñas no deberán almacenarse directamente como texto plano.

---

## 🌿 Control de versiones

La rama principal del proyecto es:

```text
main
```

Para nuevas funcionalidades se recomienda trabajar mediante ramas:

```text
feature/auth
feature/jugadores
feature/juegos
feature/boletos
feature/bonos
feature/admin
feature/database
```

Ejemplo:

```bash
git checkout -b feature/jugadores
```

Después:

```bash
git add .
git commit -m "feat: agregar gestión de jugadores"
git push origin feature/jugadores
```

Los cambios deberán integrarse a `main` mediante Pull Request.

---

## 🧪 Pruebas

El proyecto cuenta con un directorio destinado a pruebas:

```text
tests/
```

Se realizarán pruebas para validar el funcionamiento de los principales módulos, incluyendo:

* Registro.
* Inicio de sesión.
* Jugadores.
* Juegos.
* Bonos.
* Boletos.
* Validación de boletos.
* Permisos de administrador.

---

## 📌 Estado del proyecto

**Fase:** Fase 2 — Sprint 0

### Planeación

* [x] Creación del repositorio.
* [x] Configuración inicial del proyecto.
* [x] Configuración de TypeScript.
* [x] Configuración de ESLint.
* [x] Configuración de Prettier.
* [x] Creación de estructura inicial.
* [ ] Desarrollo de API.
* [ ] Base de datos.
* [ ] Autenticación.
* [ ] Gestión de jugadores.
* [ ] Gestión de juegos.
* [ ] Gestión de boletos.
* [ ] Gestión de bonos.
* [ ] Validación de QR.
* [ ] Pruebas.

---

## 📄 Documentación

La documentación del Backend podrá incluir:

* Requisitos.
* Historias de usuario.
* Product Backlog.
* Arquitectura.
* Modelo de datos.
* Documentación de API.
* Manual de instalación.
* Pruebas.

---

## 🏇 Proyecto

**Vaqueros Reynosa**

Backend de la plataforma web para aficionados, administración del equipo, juegos, boletos y bonos.
