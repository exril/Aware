pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        stage('Restart Container') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }
}