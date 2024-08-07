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
        stage('Build Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        def app = docker.build("${DOCKER_IMAGE}:${env.BUILD_ID}", "-f ${DOCKERFILE_PATH} nodejs-app")
                        app.push("latest")
                        app.push("${env.BUILD_ID}")
                    }
                }
            }
        }
        stage('Update Helm Chart') {
            steps {
                script {
                    // Update Helm chart values.yaml with new image tag
                    sh "sed -i 's/tag:.*/tag: \"${env.BUILD_ID}\"/' ${HELM_CHART_PATH}/values.yaml"
                    
                    // Configure Git for commits
                    sh "git config --global user.email 'raisalsalim333@gmail.com'"
                    sh "git config --global user.name 'raisalsalim'"
                    
                    withCredentials([usernamePassword(credentialsId: GIT_CREDENTIALS_ID, usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                        sh "git remote set-url origin https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/raisalsalim/nodejs-app-helm-flux.git"
                        sh "git add ${HELM_CHART_PATH}/values.yaml"
                        sh "git commit -m '[JENKINS] Update Helm chart image tag to ${env.BUILD_ID}'"
                        sh "git push origin HEAD:main"
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            when {
                expression {
                    // Avoid deploying if the latest commit message is from Jenkins
                    def commitMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    echo "Latest commit message: ${commitMessage}"
                    return !commitMessage.startsWith('[JENKINS]')
                }
            }
            steps {
                script {
                    sh "helm upgrade nodejs-app ${HELM_CHART_PATH} --namespace default --kubeconfig /var/lib/jenkins/.kube/config"
                }
            }
        }
    }
}
