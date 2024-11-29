#!/bin/bash



python tdextract.py &

node app.js &


# insights
node api.js &

node apiSystem.js &

# Wait for both processes to finish
wait
