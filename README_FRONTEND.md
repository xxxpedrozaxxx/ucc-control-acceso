# Frontend - Sistema de Control de Acceso UCC

## 🏗️ Arquitectura Clean Architecture

Este proyecto implementa Clean Architecture con las siguientes capas:

```
src/
├── modules/
│   └── login/
│       ├── domain/              # Lógica de negocio pura
│       │   ├── entities/        # Entidades del dominio (User)
│       │   ├── repositories/    # Interfaces de repositorios
│       │   └── usecases/        # Casos de uso
│       ├── infrastructure/      # Implementaciones externas
│       │   ├── api/            # Cliente HTTP
│       │   └── repositories/   # Implementación de repositorios
│       ├── application/         # Lógica de aplicación
│       │   └── hooks/          # React Hooks personalizados
│       └── presentation/        # Capa de presentación
│           ├── components/     # Componentes React
│           └── pages/          # Páginas/Vistas
```

## 🚀 Instalación

### Requisitos previos
- Node.js 18+ 
- npm o yarn

### Pasos de instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Editar `.env` con la URL de tu backend:
```
REACT_APP_API_URL=http://localhost:3000
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

## 🎨 Stack Tecnológico

- **React 18** - Framework frontend
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP
- **JavaScript** - Lenguaje (ES6+)

## 📱 Módulo de Login

### Características implementadas

✅ **Diseño según especificaciones:**
- Logo UCC centrado en la parte superior
- Mensaje "Ingrese su ID Institucional"
- Campo de entrada solo numérico
- Botón de ingreso con estados (loading, disabled)
- Mensajes de error amigables
- Diseño responsive

✅ **Clean Architecture:**
- Separación clara de capas
- Casos de uso desacoplados
- Repositorios con interfaces
- Hooks personalizados para lógica de UI

✅ **Validaciones:**
- ID institucional requerido
- Solo números permitidos
- Validación en cliente y servidor
- Manejo de errores robusto

### Flujo de Login

```
Usuario ingresa ID → useLogin hook → ValidateInstitutionalIdUseCase 
→ AuthRepository → API Backend → Respuesta → Navegación
```

## 🎨 Colores Corporativos UCC

Los colores oficiales están configurados en `tailwind.config.js`:

```javascript
colors: {
  'ucc-azul': {
    primary: '#003DA5',
    dark: '#002870',
    light: '#4A7BBA',
  },
  'ucc-naranja': {
    primary: '#FF6B35',
    light: '#FF8C5F',
    dark: '#E55A2B',
  }
}
```

Uso en componentes:
```jsx
<div className="bg-ucc-azul-primary text-white">...</div>
<button className="bg-ucc-naranja-primary hover:bg-ucc-naranja-dark">...</button>
```

## 📦 Scripts Disponibles

```bash
npm run dev      # Ejecutar en modo desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de build de producción
```

## 🔌 Integración con Backend

El módulo de login está preparado para conectarse con el backend mediante:

**Endpoint esperado:**
```
POST /api/auth/login
Body: { "id_institucional": "80123456" }
Response: { "usuario": { ... } }
```

El cliente HTTP (`apiClient.js`) incluye:
- Interceptores para tokens JWT
- Manejo de errores global
- Timeout configurado (10s)
- Redirección automática en 401

## 🧩 Próximos Módulos

Siguiendo la misma arquitectura, se implementarán:

- [ ] Módulo de Usuario (visualización de roles y datos)
- [ ] Módulo de Registro de Fallas
- [ ] Módulo de Administración
- [ ] Dashboard administrativo

## 📝 Notas de Desarrollo

- Todos los componentes usan **functional components** con hooks
- Se sigue **Clean Architecture** estrictamente
- Estilos con **Tailwind CSS** (utility-first)
- No se usa TypeScript (por requerimiento del proyecto)

## 🤝 Convenciones de Código

- Nombres de archivos: PascalCase para componentes, camelCase para utilities
- Comentarios JSDoc en funciones principales
- Imports organizados: externos → internos → relativos
- Componentes exportados con nombre (no default cuando hay múltiples exports)

---

**Desarrollado para Universidad Cooperativa de Colombia © 2026**
