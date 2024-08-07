pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "raisalsalim/nodejs-app"
        DOCKER_CREDENTIALS = credentials('docker-credentials')
        GIT_CREDENTIALS = credentials('github-credentials')
        GIT_REPO = "https://github.com/raisalsalim/nodejs-app-helm-flux.git"
        HELM_CHART_PATH = "charts/nodejs-app"
        DOCKERFILE_PATH = "nodejs-app/Dockerfile"
    }

    stages {
        stage('Declarative: Checkout SCM') {
            steps {
                checkout scm
            }
        }
        stage('Check Commit Message') {
            steps {
                script {
                    def commitMessage = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                    if (commitMessage.contains("[JENKINS]")) {
                        currentBuild.result = 'SUCCESS'
                        echo "Skipping build for Jenkins automated commit"
                        return
                    }
                }
            }
        }
        stage('Build Docker Image') {
            when {
                expression { currentBuild.result != 'SUCCESS' }
                not {
                    changeset "charts/**"
                }
            }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS) {
                        def app = docker.build("${DOCKER_IMAGE}:${env.BUILD_ID}", 'nodejs-app')
                        app.push('latest')
                        app.push("${env.BUILD_ID}")
                    }
                }
            }
        }
        stage('Update Helm Chart') {
            when {
                expression { currentBuild.result != 'SUCCESS' }
            }
            steps {
                script {
                    sh 'sed -i s/tag:.*/tag: "${env.BUILD_ID}"/ charts/nodejs-app/values.yaml'
                    sh 'git config --global user.email "raisalsalim333@gmail.com"'
                    sh 'git config --global user.name "raisalsalim"'
                    withCredentials([usernamePassword(credentialsId: GIT_CREDENTIALS, passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                        sh 'git remote set-url origin https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/raisalsalim/nodejs-app-helm-flux.git'
                        sh 'git add charts/nodejs-app/values.yaml'
                        sh 'git commit -m "[JENKINS] Update Helm chart image tag to ${env.BUILD_ID}"'
                        sh 'git push origin HEAD:main'
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            when {
                expression {
                    def commitMessage = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                    return !commitMessage.contains("[JENKINS] Update Helm chart image tag")
                }
            }
            steps {
                script {
                    sh "helm upgrade nodejs-app ${HELM_CHART_PATH} --namespace default --kubeconfig /var/lib/jenkins/.kube/config"
                }
            }
        }
    }
    post {
        always {
            echo 'Finished the pipeline'
        }
    }
}
