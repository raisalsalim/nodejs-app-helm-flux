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
        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM', 
                          branches: [[name: '*/main']], 
                          userRemoteConfigs: [[url: GIT_REPO, credentialsId: GIT_CREDENTIALS_ID]]])
            }
        }
        stage('Check Commit Message') {
            steps {
                script {
                    // Get the latest commit message
                    def commitMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    
                    if (commitMessage.startsWith('[JENKINS]')) {
                        echo "Skipping build for Jenkins automated commit"
                        currentBuild.result = 'SUCCESS'
                        return
                    }
                }
            }
        }
        stage('Build Docker Image') {
            when {
                expression { currentBuild.result != 'SUCCESS' }
            }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        def app = docker.build("${DOCKER_IMAGE}:${env.BUILD_ID}", "-f ${DOCKERFILE_PATH} nodejs-app")
                        app.push("${env.BUILD_ID}")

                        // Optionally push 'latest' tag if needed
                        // app.tag("${DOCKER_IMAGE}:latest")
                        // app.push("latest")
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
                    // Update Helm chart values.yaml with new image tag
                    sh """
                        sed -i 's/tag:.*/tag: "${env.BUILD_ID}"/' ${HELM_CHART_PATH}/values.yaml
                    """
                    
                    // Configure Git for commits
                    sh "git config --global user.email 'raisalsalim333@gmail.com'"
                    sh "git config --global user.name 'raisalsalim'"
                    
                    withCredentials([usernamePassword(credentialsId: GIT_CREDENTIALS_ID, usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                        // Use the credentials directly in the Git commands
                        sh """
                            git remote set-url origin https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/raisalsalim/nodejs-app-helm-flux.git
                            git add ${HELM_CHART_PATH}/values.yaml
                            git commit -m '[JENKINS] Update Helm chart image tag to ${env.BUILD_ID}'
                            git push origin HEAD:main
                        """
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            when {
                expression { currentBuild.result != 'SUCCESS' }
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
