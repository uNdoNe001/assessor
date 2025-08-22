# frontend/Dockerfile
# ...
ENV HOST=0.0.0.0
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
