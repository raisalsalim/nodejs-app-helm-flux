pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "raisalsalim/nodejs-app"
        DOCKER_CREDENTIALS_ID = "docker-credentials"
        GIT_CREDENTIALS_ID = "git-credentials"
        GIT_REPO = "https://github.com/raisalsalim/nodejs-app-helm-flux.git"
        HELM_CHART_PATH = "charts/nodejs-app"
        DOCKERFILE_PATH = "nodejs-app/Dockerfile"
        BRANCH_NAME = "main" // Add this line to specify the branch
    }
    stages {
        stage('Checkout Code') {
            steps {
                script {
                    // Checkout the repository
                    git branch: "${BRANCH_NAME}", url: GIT_REPO, credentialsId: GIT_CREDENTIALS_ID
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        def app = docker.build("${DOCKER_IMAGE}:${env.BUILD_ID}", "-f ${DOCKERFILE_PATH} .")
                        app.push("latest")
                        app.push("${env.BUILD_ID}")
                    }
                }
            }
        }
        stage('Update Helm Chart') {
            steps {
                script {
                    sh "sed -i 's/tag:.*/tag: \"${env.BUILD_ID}\"/' ${HELM_CHART_PATH}/values.yaml"
                    sh "git config --global user.email 'raisalsalim333@gmail.com'"
                    sh "git config --global user.name 'raisalsalim'"
                    withCredentials([usernamePassword(credentialsId: GIT_CREDENTIALS_ID, usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                        sh "git remote set-url origin https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/raisalsalim/nodejs-app-helm-flux.git"
                        sh "git add ${HELM_CHART_PATH}/values.yaml"
                        sh "git commit -m 'Update Helm chart image tag to ${env.BUILD_ID}'"
                        sh "git push origin HEAD:${BRANCH_NAME}"
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Ensure the Kubernetes config file path is correct and accessible
                    sh "helm upgrade nodejs-app ${HELM_CHART_PATH} --namespace default --kubeconfig /var/lib/jenkins/.kube/config || { echo 'Helm upgrade failed'; exit 1; }"
                }
            }
        }
    }
    post {
        always {
            cleanWs()  // Clean workspace after each build
        }
        failure {
            echo 'Build failed.'
        }
    }
}
