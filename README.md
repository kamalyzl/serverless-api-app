# API Serverless de Clima Planetario

API para consultar y almacenar información del clima de planetas, integrando datos de SWAPI y Open-Meteo, usando AWS Lambda, DynamoDB, Redis y el framework Serverless.

---

## Requisitos

- Node.js >= 20.x
- AWS CLI configurado (para despliegue en AWS)
- Docker (opcional, para emulación local de DynamoDB/Redis)
- Cuenta de AWS (para despliegue real)
- Serverless Framework (`npm install -g serverless`)
- Variables de entorno:
  - `SWAPI_BASE_URL` (ej: `https://swapi.py4e.com/api`)
  - `WEATHER_BASE_URL` (ej: `https://api.open-meteo.com/v1/forecast`)
  - `DYNAMODB_TABLE` (ej: `PlanetWeatherTable`)
  - `REDIS_URL` (si usas Redis en cloud/local)

---

## Instalación

```bash
git clone <repo-url>
cd serverless-api-app
npm install
```

---

## Levantar en local

1. **Variables de entorno**  
   Crea un archivo `.env` en la raíz con las variables necesarias:
   ```
   SWAPI_BASE_URL=https://swapi.py4e.com/api
   WEATHER_BASE_URL=https://api.open-meteo.com/v1/forecast
   DYNAMODB_TABLE=PlanetWeatherTable
   REDIS_URL=redis://localhost:6379
   ```

2. **Ejecutar en modo offline**  
   Levanta el entorno local con:
   ```bash
   npm run offline
   ```
   Esto inicia el emulador de AWS Lambda y expone los endpoints HTTP localmente.

3. **Probar endpoints**  
   Puedes probar los endpoints con herramientas como Postman o curl:
   - `GET http://localhost:3000/fusionados`
   - `POST http://localhost:3000/almacenar`
   - `GET http://localhost:3000/historial`

---

## Despliegue en AWS

```bash
npm run deploy
```
Esto desplegará la infraestructura y funciones en AWS usando Serverless Framework.

Para eliminar la infraestructura:
```bash
npm run remove
```

---

## Estructura de carpetas

```
src/
  application/
    mappers/                # Mapeadores de datos entre capas
    useCases/               # Casos de uso principales (lógica de negocio)
  domain/
    dtos/                   # Objetos de transferencia de datos
    models/                 # Modelos de dominio
    repositories/           # Interfaces de repositorios
    services/               # Servicios de dominio (integraciones)
    value-objects/          # Objetos de valor
    PlanetLocation.ts       # Lógica de localización planetaria
  infrastructure/
    apis/                   # Integraciones externas (SWAPI, Weather)
      types/                # Tipos de respuesta de APIs externas
    cache/                  # Configuración y servicios de caché (Redis)
    database/
      dynamo/               # Cliente DynamoDB
    logger/                 # Loggers y utilidades de logging
    repositories/           # Implementaciones de repositorios (DynamoDB)
  presentation/
    lambdas/                # Handlers de AWS Lambda (endpoints)
  shared/
    utils/                  # Utilidades compartidas
```

---

## Arquitectura

- **Limpia (Clean Architecture)**: Separación clara entre dominio, aplicación, infraestructura y presentación.
- **Serverless**: AWS Lambda para lógica de negocio, DynamoDB para persistencia, Redis para caché.
- **Integraciones externas**: SWAPI (planetas/personajes) y Open-Meteo (clima).
- **Documentación OpenAPI**: Incluida en `openapi.yml` y generada automáticamente con `serverless-openapi-documentation`.
- **Testing**: Pruebas unitarias y de integración con Jest.

---

## Proveedores y tecnologías usadas

- **AWS Lambda**: Ejecución serverless de funciones.
- **API Gateway**: Exposición de endpoints HTTP.
- **DynamoDB**: Base de datos NoSQL para almacenamiento de registros de clima.
- **Redis**: Caché para optimizar consultas.
- **Serverless Framework**: Orquestación y despliegue.
- **SWAPI**: API pública de Star Wars para datos de planetas/personajes.
- **Open-Meteo**: API pública para datos meteorológicos.
- **TypeScript**: Tipado estático y robustez.
- **Jest**: Testing unitario e integración.

---

## Scripts útiles

- `npm run offline` — Levanta el entorno local (serverless-offline)
- `npm run deploy` — Despliega en AWS
- `npm run remove` — Elimina la infraestructura de AWS
- `npm test` — Ejecuta los tests
- `npm run test:watch` — Ejecuta los tests en modo watch
- `npm run build` — Empaqueta el proyecto para despliegue
- `npm run info` — Muestra información del stack desplegado

---

## Endpoints principales

- `GET /fusionados` — Datos fusionados de clima planetario
- `POST /almacenar` — Almacena datos agregados de clima
- `GET /historial` — Historial de clima de un planeta

### Ejemplo de respuesta `/fusionados`
```json
{
  "mergedData": [
    {
      "planet": "Tatooine",
      "temperature": 42,
      "description": "Desértico y árido"
    }
  ]
}
```

### Ejemplo de respuesta `/historial`
```json
{
  "planet": "Tatooine",
  "weatherHistory": [
    {
      "date": "2024-06-01T12:00:00Z",
      "temperature": 42,
      "description": "Desértico y árido"
    }
  ]
}
```

---

## Testing

Para ejecutar los tests unitarios y de integración:
```bash
npm test
```

---

## Notas adicionales

- El proyecto está preparado para escalar y añadir nuevos endpoints o integraciones fácilmente.
- Puedes extender la arquitectura agregando autenticación, más fuentes de datos o nuevas entidades de dominio.
- La documentación OpenAPI se encuentra en `openapi.yml` y puede ser usada para generar clientes o documentación interactiva.

---

## Autor y licencia

Desarrollado por [Tu Nombre o Equipo].
Licencia ISC.

---

## Monitoreo y logs con CloudWatch

- **Integración automática**: El proyecto está configurado para enviar todos los logs de las funciones Lambda y del API Gateway a AWS CloudWatch Logs. Esto se habilita en el archivo `serverless.yml`:
  ```yaml
  provider:
    logs:
      restApi: true         # Habilita logs de API Gateway
      httpApi: true         # Habilita logs de HTTP API
  ```
- **Permisos**: Se otorgan permisos IAM para crear y escribir en los grupos de logs de CloudWatch:
  ```yaml
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - logs:CreateLogGroup
            - logs:CreateLogStream
            - logs:PutLogEvents
  ```
- **Logging de aplicación**: Se utiliza la librería `pino` para estructurar los logs de la aplicación. Los logs generados por los servicios y casos de uso se envían automáticamente a CloudWatch cuando se ejecutan en AWS Lambda.
- **Ventajas**:
  - Permite monitorear en tiempo real la actividad y errores de la API.
  - Facilita el debugging y la auditoría de las operaciones.
  - Se pueden crear métricas y alarmas personalizadas en AWS CloudWatch basadas en los logs.

---

## Endpoint de desarrollo

Para realizar pruebas en el entorno de desarrollo desplegado en AWS, utiliza el siguiente dominio base:

```
https://9dczjw7gpi.execute-api.us-east-1.amazonaws.com/development
```

Por ejemplo:
- `GET https://9dczjw7gpi.execute-api.us-east-1.amazonaws.com/development/fusionados`
- `POST https://9dczjw7gpi.execute-api.us-east-1.amazonaws.com/development/almacenar`
- `GET https://9dczjw7gpi.execute-api.us-east-1.amazonaws.com/development/historial`

---
