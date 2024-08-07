pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "raisalsalim/nodejs-app"
        DOCKER_CREDENTIALS_ID = "docker-credentials"
        GIT_CREDENTIALS_ID = "git-credentials"
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
        stage('Build Docker Image') {
            when {
                not {
                    changeset "charts/**"
                }
            }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-credentials') {
                        def app = docker.build("raisalsalim/nodejs-app:${env.BUILD_ID}", 'nodejs-app')
                        app.push('latest')
                        app.push("${env.BUILD_ID}")
                    }
                }
            }
        }
        stage('Update Helm Chart') {
            steps {
                script {
                    sh 'sed -i s/tag:.*/tag: "${env.BUILD_ID}"/ charts/nodejs-app/values.yaml'
                    sh 'git config --global user.email "raisalsalim333@gmail.com"'
                    sh 'git config --global user.name "raisalsalim"'
                    withCredentials([usernamePassword(credentialsId: 'github-credentials', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
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
                echo "Deploying to Kubernetes..."
                // Add your deployment steps here
            }
        }
    }
    post {
        always {
            echo 'Finished the pipeline'
        }
    }
}

