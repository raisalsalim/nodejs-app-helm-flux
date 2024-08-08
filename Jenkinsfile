pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "raisalsalim/nodejs-app"
        DOCKER_CREDENTIALS_ID = "docker-credentials"
        GIT_CREDENTIALS_ID = "git-credentials"
        GIT_REPO = "https://github.com/raisalsalim/nodejs-app-helm-flux.git"
        HELM_CHART_PATH = "charts/nodejs-app"
        DOCKERFILE_PATH = "nodejs-app/Dockerfile"
        LOCAL_REGISTRY = "localhost:5000" // Local registry URL
        APP_URL = "http://your-app-url" // Replace with your app's URL or IP address
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
                    // Output current working directory
                    sh 'pwd'

                    // Output contents of values.yaml before update
                    sh "cat ${HELM_CHART_PATH}/values.yaml"

                    // Update image tag in values.yaml
                    sh "sed -i 's/tag:.*/tag: \"${env.BUILD_ID}\"/' ${HELM_CHART_PATH}/values.yaml"

                    // Output contents of values.yaml after update
                    sh "cat ${HELM_CHART_PATH}/values.yaml"
                    
                    // Git configuration and status check
                    sh "git config --global user.email 'raisalsalim333@gmail.com'"
                    sh "git config --global user.name 'raisalsalim'"
                    sh "git status"
                    
                    withCredentials([usernamePassword(credentialsId: GIT_CREDENTIALS_ID, usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                        sh "git remote set-url origin https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/raisalsalim/nodejs-app-helm-flux.git"
                        sh "git add ${HELM_CHART_PATH}/values.yaml"
                        sh "git status"
                        sh "git commit -m '[JENKINS] Update Helm chart image tag to ${env.BUILD_ID}'"
                        sh "git log -1"
                        sh "git push origin HEAD:main"
                    }
                    
                    // Output Git logs to confirm push
                    sh "git log -1"
                }
            }
        }
        stage('Deploy to Kubernetes') {
            when {
                expression { currentBuild.result != 'SUCCESS' }
            }
            steps {
                script {
                    // Check if the Ingress resource exists
                    def ingressExists = sh(
                        script: "kubectl get ingress nodejs-app-ingress --namespace default --kubeconfig /var/lib/jenkins/.kube/config || echo 'NotFound'",
                        returnStdout: true
                    ).trim()
        
                    // If the Ingress exists, delete it
                    if (ingressExists != 'NotFound') {
                        echo "Ingress resource 'nodejs-app-ingress' exists, deleting it before proceeding with Helm upgrade."
                        sh "kubectl delete ingress nodejs-app-ingress --namespace default --kubeconfig /var/lib/jenkins/.kube/config"
                    }
        
                    // Proceed with Helm upgrade
                    sh "helm history nodejs-app --namespace default --kubeconfig /var/lib/jenkins/.kube/config"
                    sh "helm upgrade --install nodejs-app ${HELM_CHART_PATH} --namespace default --kubeconfig /var/lib/jenkins/.kube/config --set image.tag=${env.BUILD_ID} --force"
                    sh "helm history nodejs-app --namespace default --kubeconfig /var/lib/jenkins/.kube/config"
                    sh "kubectl describe deployment nodejs-app --namespace default --kubeconfig /var/lib/jenkins/.kube/config"

                    // Print the output of the application using curl
                    echo "Checking application status with curl..."
                    sh "curl -s ${APP_URL}"
                }
            }
        }
        stage('Push to Local Registry') {
            when {
                expression { currentBuild.result != 'SUCCESS' }
            }
            steps {
                script {
                    def imageTag = "${DOCKER_IMAGE}:${env.BUILD_ID}"
                    def localRegistryImage = "${LOCAL_REGISTRY}/${DOCKER_IMAGE}:${env.BUILD_ID}"

                    // Tag the Docker image for the local registry
                    sh "docker tag ${imageTag} ${localRegistryImage}"
                    
                    // Push the Docker image to the local registry
                    sh "docker push ${localRegistryImage}"
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
