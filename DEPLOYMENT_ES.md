# 🚀 Guía de Instalación en AWS - Paso a Paso

Esta guía te llevará desde cero hasta tener tu bot HOF Manager funcionando en AWS de forma serverless.

---

## 📋 Prerequisitos

### 1. Instalar Node.js 20+

**macOS (usando Homebrew):**
```bash
brew install node@20
```

**Verificar instalación:**
```bash
node --version  # Debe mostrar v20.x.x
npm --version
```

### 2. Crear Cuenta de AWS

1. Ve a [aws.amazon.com](https://aws.amazon.com)
2. Click en "Crear una cuenta de AWS"
3. Completa el registro (necesitarás una tarjeta de crédito, pero usaremos el free tier)
4. **Importante:** Activa MFA (autenticación de dos factores) para seguridad

### 3. Instalar AWS CLI

**macOS:**
```bash
brew install awscli
```

**Verificar instalación:**
```bash
aws --version  # Debe mostrar aws-cli/2.x.x
```

### 4. Configurar Credenciales de AWS

#### Paso A: Crear un Usuario IAM

1. Inicia sesión en la [Consola de AWS](https://console.aws.amazon.com)
2. Busca "IAM" en el buscador superior
3. Click en "Users" (Usuarios) → "Add users" (Agregar usuarios)
4. Nombre del usuario: `serverless-deployer`
5. Marca **"Access key - Programmatic access"**
6. Click "Next: Permissions"
7. Click "Attach existing policies directly"
8. Busca y marca estas políticas:
   - `AdministratorAccess` (para desarrollo)
   - **Nota:** En producción, usar permisos más restrictivos
9. Click "Next" hasta "Create user"
10. **¡IMPORTANTE!** Guarda el `Access Key ID` y `Secret Access Key` en un lugar seguro

#### Paso B: Configurar AWS CLI

```bash
aws configure
```

Ingresa:
- **AWS Access Key ID:** `[tu access key]`
- **AWS Secret Access Key:** `[tu secret key]`
- **Default region name:** `us-east-1` (o tu región preferida)
- **Default output format:** `json`

**Verificar configuración:**
```bash
aws sts get-caller-identity
```

Debes ver tu `UserId` y `Account` ID.

### 5. Instalar Serverless Framework

```bash
npm install -g serverless
```

**Verificar instalación:**
```bash
serverless --version  # Debe mostrar Framework Core: 3.x.x
```

---

## 🤖 Configuración del Bot de Discord

### 1. Crear Aplicación en Discord

1. Ve al [Discord Developer Portal](https://discord.com/developers/applications)
2. Click en "New Application"
3. Nombre: `HOF Manager` (o el que prefieras)
4. Click "Create"

### 2. Obtener las Credenciales

#### A. Client ID
1. En "General Information"
2. Copia el **Application ID** (este es tu `CLIENT_ID`)

#### B. Public Key
1. En "General Information"
2. Copia el **Public Key** (este es tu `DISCORD_PUBLIC_KEY`)

#### C. Bot Token
1. Ve a la sección "Bot" en el menú lateral
2. Click en "Add Bot" → "Yes, do it!"
3. Click en "Reset Token" → "Yes, do it!"
4. Copia el token (este es tu `BOT_TOKEN`)
5. **⚠️ IMPORTANTE:** Nunca compartas este token

### 3. Configurar Permisos del Bot

En la sección "Bot":
1. Marca estos permisos bajo "Privileged Gateway Intents":
   - ✅ Server Members Intent
   - ✅ Message Content Intent

2. En "OAuth2" → "URL Generator":
   - **Scopes:** Marca `bot` y `applications.commands`
   - **Bot Permissions:** Marca:
     - Send Messages
     - Embed Links
     - Attach Files
     - Use Slash Commands
     - Manage Roles (si usarás validación por roles)
   
3. Copia la URL generada e invita el bot a tu servidor de Discord

### 4. Obtener el Guild ID (ID del Servidor)

1. En Discord (aplicación), ve a "Configuración" → "Avanzado"
2. Activa el "Modo desarrollador"
3. Click derecho en tu servidor → "Copiar ID" (este es tu `GUILD_ID`)

---

## ⚙️ Configuración del Proyecto

### 1. Navegar al Proyecto

```bash
cd ~/Documents/HOFManager
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea el archivo `.env`:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
# Discord Configuration
DISCORD_PUBLIC_KEY=tu_public_key_de_discord
BOT_TOKEN=tu_bot_token
CLIENT_ID=tu_client_id
GUILD_ID=tu_guild_id

# Optional: Role IDs (para validación de roles)
CLAN_LEADER_ROLE_ID=
CLAN_MEMBER_ROLE_ID=
```

**Para obtener Role IDs (opcional):**
1. En Discord, escribe: `\@nombre_del_rol`
2. Copia el número que aparece (ej: `<@&123456789>` → el ID es `123456789`)

---

## 🚀 Desplegar en AWS

### 1. Verificar Configuración

Asegúrate de estar en el directorio del proyecto:
```bash
pwd  # Debe mostrar: /Users/gmartino/Documents/HOFManager
```

### 2. Desplegar (Ambiente de Desarrollo)

```bash
npm run deploy:dev
```

Este comando hará lo siguiente:
- ✅ Crear 2 funciones Lambda
- ✅ Crear 3 tablas DynamoDB
- ✅ Crear 1 bucket S3
- ✅ Crear API Gateway
- ✅ Configurar cron job para recordatorios diarios

**Proceso de despliegue (toma 2-5 minutos):**
```
Deploying hofmanager-bot to stage dev (us-east-1)
Creating CloudFormation stack...
Creating resources...
  ✓ Lambda functions
  ✓ DynamoDB tables
  ✓ S3 bucket
  ✓ API Gateway
```

**Al finalizar verás:**
```
✔ Service deployed to stack hofmanager-bot-dev

endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/interactions

functions:
  interactions: hofmanager-bot-dev-interactions
  dailyReminder: hofmanager-bot-dev-dailyReminder
```

**📝 COPIA LA URL del endpoint** - la necesitarás en el siguiente paso.

---

## 🔗 Conectar Discord con AWS

### 1. Configurar Interactions Endpoint

1. Ve al [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a "General Information"
4. En **"Interactions Endpoint URL"** pega la URL que copiaste:
   ```
   https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/interactions
   ```
5. Click "Save Changes"

**Discord enviará una petición de verificación:**
- ✅ Si ves un checkmark verde → ¡Configuración correcta!
- ❌ Si ves un error → Revisa que el `DISCORD_PUBLIC_KEY` en `.env` sea correcto y vuelve a desplegar

### 2. Registrar Comandos Slash

```bash
npm run deploy
```

Este comando registra todos los comandos slash (`/donation`, `/report-week`, etc.) en Discord.

**Salida esperada:**
```
Started refreshing application (/) commands.
Successfully reloaded application (/) commands.
Commands deployed successfully!
```

---

## ✅ Verificar que Todo Funciona

### 1. Ver Logs en Tiempo Real

```bash
npm run logs
```

### 2. Probar el Bot en Discord

Ve a tu servidor de Discord y prueba:

1. **Registrar un personaje:**
   ```
   /register-char
   ```
   - Completa el formulario
   - Debes ver: "✅ Character registered successfully!"

2. **Registrar una donación:**
   ```
   /donation
   ```
   - Completa el formulario
   - Debes ver: "✅ Donation recorded successfully!"

3. **Ver tu historial:**
   ```
   /history-user
   ```
   - Debes ver una tabla con tus donaciones

4. **Generar reporte semanal:**
   ```
   /report-week
   ```
   - Debes ver un mensaje con un link para descargar CSV

### 3. Verificar en AWS Console

#### DynamoDB (Base de Datos)
1. Ve a [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb)
2. Click en "Tables"
3. Debes ver 3 tablas:
   - `hofmanager-bot-users-dev`
   - `hofmanager-bot-donations-dev`
   - `hofmanager-bot-config-dev`
4. Click en una tabla → "Explore table items"
5. Debes ver los datos que ingresaste en Discord

#### Lambda (Funciones)
1. Ve a [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Debes ver 2 funciones:
   - `hofmanager-bot-dev-interactions`
   - `hofmanager-bot-dev-dailyReminder`

#### S3 (Almacenamiento de Reportes)
1. Ve a [AWS S3 Console](https://s3.console.aws.amazon.com)
2. Debes ver el bucket: `hofmanager-bot-reports-dev-[tu-account-id]`

---

## 🔧 Comandos Útiles

### Ver Logs de Lambda
```bash
npm run logs
```

### Re-desplegar Cambios
```bash
npm run deploy:dev
```

### Invocar Función Manualmente (para testing)
```bash
# Probar el recordatorio diario
serverless invoke --function dailyReminder

# Ver logs de una función específica
serverless logs --function interactions --tail
```

### Eliminar Todo (⚠️ Borra TODOS los recursos y datos)
```bash
npm run remove:dev
```

---

## 💰 Costos Estimados

Con el uso esperado de un clan pequeño (~50 usuarios):

| Servicio | Costo/Mes |
|----------|-----------|
| Lambda | **$0.00** (Free tier: 1M requests) |
| DynamoDB | **$0.00** (Free tier: 25GB) |
| API Gateway | **$0.00** (Free tier: 1M requests) |
| S3 | **$0.01** (archivos CSV) |
| **TOTAL** | **~$0.01/mes** |

**Después del free tier (12 meses):** ~$0.15/mes

---

## 🚨 Solución de Problemas

### Error: "Invalid signature"
```bash
# Verifica que DISCORD_PUBLIC_KEY sea correcto
cat .env | grep DISCORD_PUBLIC_KEY

# Re-despliega
npm run deploy:dev
```

### Error: "Missing authentication token"
```bash
# Configura AWS CLI de nuevo
aws configure
```

### Los comandos no aparecen en Discord
```bash
# Re-registra los comandos
npm run deploy

# Espera 5-10 minutos para que Discord los propague
```

### Error al crear tablas DynamoDB
```bash
# Verifica que no existan tablas con el mismo nombre
aws dynamodb list-tables

# Si existen, elimínalas o cambia el nombre en serverless.yml
```

---

## 🔐 Seguridad

- ✅ **Nunca** subas el archivo `.env` a Git
- ✅ Usa MFA en tu cuenta de AWS
- ✅ Rota el `BOT_TOKEN` cada 3-6 meses
- ✅ Revisa los logs de CloudWatch regularmente
- ✅ Usa roles IAM con permisos mínimos en producción

---

## 📊 Monitoreo

### CloudWatch Logs
```bash
# AWS Console
https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups

# Busca:
/aws/lambda/hofmanager-bot-dev-interactions
/aws/lambda/hofmanager-bot-dev-dailyReminder
```

### CloudWatch Metrics
```bash
# Monitorea:
- Lambda invocations
- Lambda errors
- DynamoDB read/write capacity
- API Gateway requests
```

---

## 🎯 Próximos Pasos (Opcional)

### 1. Desplegar a Producción

Cuando estés listo:
```bash
npm run deploy:prod
```

**⚠️ Importante:** Actualiza la URL de Interactions en Discord con la URL de producción.

### 2. Configurar Dominio Personalizado

En `serverless.yml`, agrega:
```yaml
custom:
  customDomain:
    domainName: bot.tudominio.com
    certificateName: '*.tudominio.com'
    basePath: ''
    stage: ${self:provider.stage}
```

### 3. Configurar Alertas

Crea alarmas en CloudWatch para:
- Errores en Lambda (> 5 errores en 5 minutos)
- Latencia alta (> 3 segundos)
- Costos inesperados

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs:**
   ```bash
   npm run logs
   ```

2. **Verifica variables de entorno:**
   ```bash
   cat .env
   ```

3. **Consulta la documentación:**
   - [Discord.js Guide](https://discordjs.guide/)
   - [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
   - [Serverless Framework](https://www.serverless.com/framework/docs)

---

**¡Listo! Tu bot debería estar funcionando en AWS. ⚔️**

**Hecho para guerreros. Administrado por campeones.**
