set ES5_DIR1=www\js\
set ES5_DIR2=www\js\service\
set ES5_DIR3=www\js\modules\
set ES6_DIR1=es6\
set ES6_DIR2=es6\service\
set ES6_DIR3=es6\modules\

copy %ES5_DIR1% %ES6_DIR1%
copy %ES5_DIR2% %ES6_DIR2%
copy %ES5_DIR3% %ES6_DIR3%

gulp babel
