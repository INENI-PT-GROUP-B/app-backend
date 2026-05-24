{{/*
Chart name.
*/}}
{{- define "app-chart.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{/*
Base name for resources. Uses the tenant name when set, otherwise the release
name.
*/}}
{{- define "app-chart.fullname" -}}
{{- $base := .Values.tenant | default .Release.Name -}}
{{- $base | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels applied to every object.
*/}}
{{- define "app-chart.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
app.kubernetes.io/name: {{ include "app-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if .Values.tenant }}
app.kubernetes.io/part-of: {{ .Values.tenant }}
{{- end }}
{{- end -}}

{{/*
Backend selector labels.
*/}}
{{- define "app-chart.backendSelectorLabels" -}}
app.kubernetes.io/name: {{ include "app-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: backend
{{- end -}}

{{/*
Frontend selector labels.
*/}}
{{- define "app-chart.frontendSelectorLabels" -}}
app.kubernetes.io/name: {{ include "app-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: frontend
{{- end -}}
