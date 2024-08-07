{{- define "nodejs-app.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "nodejs-app.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "nodejs-app.labels" -}}
app.kubernetes.io/name: {{ include "nodejs-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
