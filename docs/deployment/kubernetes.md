# Kubernetes Deployment

Deploy Sekha Controller to Kubernetes for production-grade, scalable memory management.

## Overview

Kubernetes deployment provides:

- ✅ **High availability** - Multiple replicas with load balancing
- ✅ **Auto-scaling** - HPA based on CPU/memory/custom metrics
- ✅ **Rolling updates** - Zero-downtime deployments
- ✅ **Resource management** - Requests and limits
- ✅ **Health checks** - Liveness and readiness probes
- ✅ **Secret management** - Secure API keys and credentials

**Status:** Kubernetes manifests and Helm chart coming in v1.1.

---

## Prerequisites

- Kubernetes 1.25+
- kubectl configured
- Helm 3.12+ (for Helm deployment)
- Persistent storage (PVC support)
- PostgreSQL database (managed or self-hosted)
- ChromaDB deployment
- Ollama deployment (optional, for embeddings)

---

## Architecture

```
                   ┌───────────────────┐
                   │   Ingress/LB      │
                   │  (nginx/traefik)  │
                   └─────────┬──────────┘
                            │
         ┌──────────────┼──────────────┐
         │               │               │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │  Sekha  │    │  Sekha  │    │  Sekha  │
    │  Pod 1  │    │  Pod 2  │    │  Pod 3  │
    └───┬───┬──┘    └───┬───┬──┘    └───┬───┬──┘
        │    │            │    │            │    │
    ┌───┴────┴───────────┴────┴────────────┴────┴───┐
    │                                                      │
    │          ┌─────────────┐  ┌────────────┐   │
    │          │  PostgreSQL │  │  ChromaDB   │   │
    │          │   (RDS/CDB)  │  │ (StatefulSet)│   │
    │          └─────────────┘  └────────────┘   │
    └──────────────────────────────────────────────────────┘
```

---

## Helm Chart (Recommended)

**Coming Soon:** Official Helm chart will be available in v1.1.

**Preview:**

```bash
# Add Sekha Helm repository
helm repo add sekha https://charts.sekha.dev
helm repo update

# Install with default values
helm install sekha sekha/sekha-controller \
  --namespace sekha \
  --create-namespace

# Install with custom values
helm install sekha sekha/sekha-controller \
  --namespace sekha \
  --values custom-values.yaml
```

**Example `values.yaml`:**

```yaml
replicaCount: 3

image:
  repository: sekhaha/sekha-controller
  tag: "latest"
  pullPolicy: IfNotPresent

resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 2000m
    memory: 2Gi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: sekha.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: sekha-tls
      hosts:
        - sekha.example.com

postgresql:
  enabled: true
  auth:
    database: sekha
    username: sekha
    existingSecret: sekha-db-secret
  primary:
    persistence:
      size: 20Gi

chroma:
  enabled: true
  persistence:
    size: 50Gi

sekha:
  config:
    logLevel: info
    maxConnections: 100
  secrets:
    apiKey: "your-secret-api-key"
    mcpApiKey: "your-mcp-api-key"
```

---

## Manual Deployment

### 1. Create Namespace

```bash
kubectl create namespace sekha
```

### 2. Create Secrets

```yaml
# sekha-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: sekha-secrets
  namespace: sekha
type: Opaque
stringData:
  REST_API_KEY: "your-rest-api-key-minimum-32-chars"
  MCP_API_KEY: "your-mcp-api-key-minimum-32-chars"
  DATABASE_URL: "postgresql://sekha:password@postgres:5432/sekha"
  CHROMA_URL: "http://chroma:8000"
  OLLAMA_URL: "http://ollama:11434"
```

```bash
kubectl apply -f sekha-secrets.yaml
```

### 3. Deploy PostgreSQL

**Option A: Use managed PostgreSQL (RDS, Cloud SQL, etc.)**

Update `DATABASE_URL` in secrets to point to your managed instance.

**Option B: Deploy PostgreSQL in-cluster**

```bash
helm install postgresql bitnami/postgresql \
  --namespace sekha \
  --set auth.database=sekha \
  --set auth.username=sekha \
  --set auth.password=sekha-password \
  --set primary.persistence.size=20Gi
```

### 4. Deploy ChromaDB

```yaml
# chroma-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: chroma
  namespace: sekha
spec:
  serviceName: chroma
  replicas: 1
  selector:
    matchLabels:
      app: chroma
  template:
    metadata:
      labels:
        app: chroma
    spec:
      containers:
      - name: chroma
        image: chromadb/chroma:latest
        ports:
        - containerPort: 8000
          name: http
        volumeMounts:
        - name: chroma-data
          mountPath: /chroma/chroma
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 4Gi
  volumeClaimTemplates:
  - metadata:
      name: chroma-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: chroma
  namespace: sekha
spec:
  selector:
    app: chroma
  ports:
  - port: 8000
    targetPort: 8000
  clusterIP: None
```

```bash
kubectl apply -f chroma-statefulset.yaml
```

### 5. Deploy Sekha Controller

```yaml
# sekha-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sekha-controller
  namespace: sekha
  labels:
    app: sekha-controller
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sekha-controller
  template:
    metadata:
      labels:
        app: sekha-controller
    spec:
      containers:
      - name: sekha
        image: sekha-ai/sekha-controller:latest
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: LOG_LEVEL
          value: "info"
        - name: REST_API_KEY
          valueFrom:
            secretKeyRef:
              name: sekha-secrets
              key: REST_API_KEY
        - name: MCP_API_KEY
          valueFrom:
            secretKeyRef:
              name: sekha-secrets
              key: MCP_API_KEY
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: sekha-secrets
              key: DATABASE_URL
        - name: CHROMA_URL
          valueFrom:
            secretKeyRef:
              name: sekha-secrets
              key: CHROMA_URL
        - name: OLLAMA_URL
          valueFrom:
            secretKeyRef:
              name: sekha-secrets
              key: OLLAMA_URL
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
---
apiVersion: v1
kind: Service
metadata:
  name: sekha-controller
  namespace: sekha
spec:
  selector:
    app: sekha-controller
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
```

```bash
kubectl apply -f sekha-deployment.yaml
```

### 6. Configure Ingress

```yaml
# sekha-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sekha-ingress
  namespace: sekha
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - sekha.example.com
    secretName: sekha-tls
  rules:
  - host: sekha.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sekha-controller
            port:
              number: 80
```

```bash
kubectl apply -f sekha-ingress.yaml
```

---

## Horizontal Pod Autoscaling

```yaml
# sekha-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sekha-hpa
  namespace: sekha
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sekha-controller
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 2
        periodSeconds: 15
      selectPolicy: Max
```

```bash
kubectl apply -f sekha-hpa.yaml
```

---

## Monitoring Integration

### ServiceMonitor (Prometheus Operator)

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sekha-controller
  namespace: sekha
spec:
  selector:
    matchLabels:
      app: sekha-controller
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

---

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n sekha
kubectl describe pod <pod-name> -n sekha
kubectl logs <pod-name> -n sekha
```

### Check Services

```bash
kubectl get svc -n sekha
kubectl describe svc sekha-controller -n sekha
```

### Test Health Endpoint

```bash
kubectl port-forward -n sekha svc/sekha-controller 8080:80
curl http://localhost:8080/health
```

### Database Connection Issues

```bash
# Test from a pod
kubectl run -it --rm debug --image=postgres:16 --restart=Never -n sekha -- \
  psql postgresql://sekha:password@postgres:5432/sekha -c "SELECT 1;"
```

---

## Production Best Practices

1. **Use managed PostgreSQL** (RDS, Cloud SQL) for reliability
2. **Enable Pod Disruption Budgets** to prevent mass evictions
3. **Configure resource requests/limits** based on load testing
4. **Use separate namespaces** for dev/staging/production
5. **Enable network policies** for security
6. **Configure backup strategies** for PostgreSQL and ChromaDB
7. **Use cert-manager** for automatic TLS certificate management
8. **Set up monitoring** with Prometheus and Grafana
9. **Configure log aggregation** (Loki, ELK, etc.)
10. **Test disaster recovery** procedures regularly

---

## Next Steps

- **[Monitoring](monitoring.md)** - Set up observability
- **[Configuration](../reference/configuration.md)** - Customize settings
- **[Security](../deployment/security.md)** - Harden deployment
- **[REST API](../api-reference/rest-api.md)** - API documentation

---

## Support

- **Issues:** [GitHub Issues](https://github.com/sekha-ai/sekha-controller/issues)
- **Discord:** [Join Community](https://discord.gg/gZb7U9deKH)
- **Documentation:** [docs.sekha.dev](https://docs.sekha.dev)
